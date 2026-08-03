/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { createApp } from "vue";
import { createPinia } from "pinia";
import { useMenuconfigStore } from "./store";
import { t } from "./i18n";
import type { Menu } from "../../menuconfig/Menu";
import Menuconfig from "./themes";

interface BackendStartupBeginMetrics {
  sessionId?: number;
  panelAgeMs?: number;
  serverInitMs?: number;
  getMenusMs?: number;
  serializeMs?: number;
  totalChunks?: number;
  totalTaskBatches?: number;
}

interface BackendStartupEndMetrics {
  sessionId?: number;
  streamMs?: number;
  panelToEndMs?: number;
}

const app = createApp(Menuconfig);
const pinia = createPinia();

app.use(pinia);

app.mount("#menuconfig");


const store = useMenuconfigStore();
let initialPayloadReceived = false;
let initialRequestRetryTimer: ReturnType<typeof setInterval> | undefined;
let initialChunkFlushTimer: ReturnType<typeof setTimeout> | undefined;
const webviewBootAt = performance.now();
const startupTimingState = {
  sessionId: 0,
  beginAt: 0,
  firstChunkAt: 0,
  lastChunkAt: 0,
  chunkCount: 0,
  appliedChunkCount: 0,
  flushCount: 0,
  flushTotalMs: 0,
  flushMaxMs: 0,
  backendBegin: undefined as BackendStartupBeginMetrics | undefined,
  profileAlways: false,
  slowThresholdMs: 1500
};
const pendingInitialChunks: Array<{
  parentId: string;
  menus: any[];
  chunkIndex?: number;
  totalChunks?: number;
}> = [];

function beginStartupSession(meta?: BackendStartupBeginMetrics, debugConfig?: { startup?: boolean; startupSlowThresholdMs?: number }): void {
  startupTimingState.sessionId = typeof meta?.sessionId === "number" ? meta.sessionId : Date.now();
  startupTimingState.beginAt = performance.now();
  startupTimingState.firstChunkAt = 0;
  startupTimingState.lastChunkAt = 0;
  startupTimingState.chunkCount = 0;
  startupTimingState.appliedChunkCount = 0;
  startupTimingState.flushCount = 0;
  startupTimingState.flushTotalMs = 0;
  startupTimingState.flushMaxMs = 0;
  startupTimingState.backendBegin = meta;
  startupTimingState.profileAlways = !!debugConfig?.startup;
  if (typeof debugConfig?.startupSlowThresholdMs === "number" && debugConfig.startupSlowThresholdMs > 0) {
    startupTimingState.slowThresholdMs = debugConfig.startupSlowThresholdMs;
  } else {
    startupTimingState.slowThresholdMs = 1500;
  }
}

function markStartupChunkReceived(chunkDelta: number): void {
  if (startupTimingState.firstChunkAt <= 0) {
    startupTimingState.firstChunkAt = performance.now();
  }
  startupTimingState.lastChunkAt = performance.now();
  startupTimingState.chunkCount += chunkDelta;
}

function maybeLogStartupSummary(backendEnd?: BackendStartupEndMetrics): void {
  if (startupTimingState.beginAt <= 0) {
    return;
  }
  if (!startupTimingState.profileAlways) {
    return;
  }

  const endAt = performance.now();
  const bootToEndMs = Math.round(endAt - webviewBootAt);
  const beginToEndMs = Math.round(endAt - startupTimingState.beginAt);
  const beginToFirstChunkMs = startupTimingState.firstChunkAt > 0
    ? Math.round(startupTimingState.firstChunkAt - startupTimingState.beginAt)
    : -1;
  const beginToLastChunkMs = startupTimingState.lastChunkAt > 0
    ? Math.round(startupTimingState.lastChunkAt - startupTimingState.beginAt)
    : -1;

  const summary = {
    sessionId: startupTimingState.sessionId,
    bootToEndMs,
    beginToEndMs,
    beginToFirstChunkMs,
    beginToLastChunkMs,
    receivedChunks: startupTimingState.chunkCount,
    appliedChunks: startupTimingState.appliedChunkCount,
    flushCount: startupTimingState.flushCount,
    flushTotalMs: Math.round(startupTimingState.flushTotalMs),
    flushMaxMs: Math.round(startupTimingState.flushMaxMs),
    backend: {
      panelAgeMs: startupTimingState.backendBegin?.panelAgeMs,
      serverInitMs: startupTimingState.backendBegin?.serverInitMs,
      getMenusMs: startupTimingState.backendBegin?.getMenusMs,
      serializeMs: startupTimingState.backendBegin?.serializeMs,
      totalChunks: startupTimingState.backendBegin?.totalChunks,
      totalTaskBatches: startupTimingState.backendBegin?.totalTaskBatches,
      streamMs: backendEnd?.streamMs,
      panelToEndMs: backendEnd?.panelToEndMs
    }
  };

  console.warn(`[KCONFIG_STARTUP] ${JSON.stringify(summary)}`);
}

window.addEventListener("error", (event) => {
  const messageText = String(event.message || "");
  if (messageText.includes("ResizeObserver loop completed with undelivered notifications.")) {
    return;
  }
  const location = `${event.filename || "unknown"}:${event.lineno || 0}:${event.colno || 0}`;
  const detail = `${event.message || "unknown error"} @ ${location}`;
  console.error("[WEBVIEW_FATAL]", detail, event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason instanceof Error
    ? `${event.reason.message}\n${event.reason.stack || ""}`
    : String(event.reason);
  console.error("[WEBVIEW_FATAL] unhandledrejection", reason);
});

function flushPendingInitialChunks(): void {
  if (initialChunkFlushTimer !== undefined) {
    clearTimeout(initialChunkFlushTimer);
    initialChunkFlushTimer = undefined;
  }

  if (pendingInitialChunks.length === 0) {
    return;
  }

  const chunks = pendingInitialChunks.splice(0, pendingInitialChunks.length);
  const flushStartedAt = performance.now();
  store.appendInitialChunks(chunks);
  const flushDuration = performance.now() - flushStartedAt;

  startupTimingState.flushCount += 1;
  startupTimingState.appliedChunkCount += chunks.length;
  startupTimingState.flushTotalMs += flushDuration;
  startupTimingState.flushMaxMs = Math.max(startupTimingState.flushMaxMs, flushDuration);
}

function clearPendingInitialChunks(): void {
  pendingInitialChunks.length = 0;
  if (initialChunkFlushTimer !== undefined) {
    clearTimeout(initialChunkFlushTimer);
    initialChunkFlushTimer = undefined;
  }
}

function scheduleInitialChunkFlush(): void {
  if (initialChunkFlushTimer !== undefined) {
    return;
  }
  initialChunkFlushTimer = setTimeout(() => {
    initialChunkFlushTimer = undefined;
    flushPendingInitialChunks();
  }, 50);
}

function requestInitialPayloadWithRetry(): void {
  store.requestInitValues();
}

function stopInitialRequestRetry(): void {
  if (initialRequestRetryTimer !== undefined) {
    clearInterval(initialRequestRetryTimer);
    initialRequestRetryTimer = undefined;
  }
}

requestInitialPayloadWithRetry();
initialRequestRetryTimer = setInterval(() => {
  if (initialPayloadReceived) {
    stopInitialRequestRetry();
    return;
  }
  requestInitialPayloadWithRetry();
}, 300);

window.addEventListener("message", (event: any) => {
  const message = event.data;
  
  switch (message.command) {
    case "load_initial_values_begin":
      initialPayloadReceived = true;
      stopInitialRequestRetry();
      clearPendingInitialChunks();
      beginStartupSession(message.meta?.startup, message.debugConfig);
      if (message.menus) {
        store.beginInitialLoad(message.menus, message.meta);
      }
      if (message.debugConfig) {
      }
      break;
    case "load_initial_values_chunk":
      if (typeof message.parentId === "string" && message.menus) {
        markStartupChunkReceived(1);
        pendingInitialChunks.push({
          parentId: message.parentId,
          menus: message.menus,
          chunkIndex: message.chunkIndex,
          totalChunks: message.totalChunks,
        });
        if (pendingInitialChunks.length >= 256) {
          flushPendingInitialChunks();
        } else {
          scheduleInitialChunkFlush();
        }
      }
      break;
    case "load_initial_values_batch":
      if (Array.isArray(message.chunks) && message.chunks.length > 0) {
        markStartupChunkReceived(message.chunks.length);
        for (const chunk of message.chunks) {
          if (!chunk || typeof chunk.parentId !== "string" || !Array.isArray(chunk.menus)) {
            continue;
          }
          pendingInitialChunks.push({
            parentId: chunk.parentId,
            menus: chunk.menus,
            chunkIndex: chunk.chunkIndex,
            totalChunks: chunk.totalChunks,
          });
        }
        if (pendingInitialChunks.length >= 256) {
          flushPendingInitialChunks();
        } else {
          scheduleInitialChunkFlush();
        }
      }
      break;
    case "load_initial_values_end":
      flushPendingInitialChunks();
      store.finishInitialLoad();
      maybeLogStartupSummary(message.startup);
      break;
    case "load_initial_values_error":
      stopInitialRequestRetry();
      clearPendingInitialChunks();
      store.finishInitialLoadWithError(message.error || t('error.loadFailed'));
      break;
    case "load_initial_values":
      initialPayloadReceived = true;
      stopInitialRequestRetry();
      clearPendingInitialChunks();
      if (message.menus) {
        store.replaceItems(message.menus, { preserveCollapse: false });
      }
      store.finishInitialLoad();
      if (message.debugConfig) {
      }
      break;
    case "refresh_values":
      if (message.menus) {
        // Snapshot current collapse state before replacing items
        const snap = new Map<string, boolean>();
        const walk = (menus: Menu[]) => {
          for (const m of menus) {
            if (!m) continue;
            const key = m.id || m.name;
            if (key && typeof m.isCollapsed === "boolean") {
              snap.set(key, m.isCollapsed);
            }
            if (m.children) walk(m.children);
          }
        };
        walk(store.items);
        store.replaceItems(message.menus, { preserveCollapse: false });
        // Restore collapse state onto new items
        const restore = (menus: Menu[]) => {
          for (const m of menus) {
            if (!m) continue;
            const key = m.id || m.name;
            if (key && snap.has(key)) {
              m.isCollapsed = snap.get(key)!;
            }
            if (m.children) restore(m.children);
          }
        };
        restore(store.items);
      }
      break;
    case "load_dictionary":
      if (message.text_dictionary) {
        store.textDictionary = message.text_dictionary;
      }
      break;
    case "visibility_delta":
      if (message.changes) {
        store.applyVisibilityDelta(message.changes);
      }
      break;
    case "menu_detail":
      if (typeof message.id === "string") {
        store.applyMenuDetail(message.id, message.detail);
      }
      break;
    case "color_theme_changed":
      if (message.themeKind) {
        store.setColorThemeKind(message.themeKind);
      }
      break;
    default:
      break;
  }
});
