<!--
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
    http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-->

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, provide } from "vue";
import { storeToRefs } from "pinia";
import { useMenuconfigStore } from "../../store";
import { Menu, menuType } from "../../../../menuconfig/Menu";
import TableRow from "./components/TableRow.vue";
import ConfirmDialog from "./components/ConfirmDialog.vue";
import PerformanceMonitor from "./components/PerformanceMonitor.vue";
import { t } from "../../i18n";
import type { DisplayRow, RowType } from "./types";
import { IconChevronDown, IconChevronUp, IconEyeClosed, IconRefresh } from "@iconify-prerendered/vue-codicon";

const store = useMenuconfigStore();
const collapseTick = ref(0);
interface PerfMonitorExpose {
  animationLevel: { value: "high" | "medium" | "low" };
  currentFps: { value: number };
  levelClass: { value: string };
}

const perfMonitorRef = ref<PerfMonitorExpose | null>(null);
const animLevel = computed(() => perfMonitorRef.value?.animationLevel.value ?? "high");
provide("animLevel", animLevel);
const { textDictionary, colorThemeKind, initialLoadInProgress, initialLoadChunkTotal, initialLoadChunkReceived, initialLoadError } = storeToRefs(store);

function onKeyDown(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey) {
    if (event.key === "z" && !event.shiftKey) {
      event.preventDefault();
      store.undo();
    } else if ((event.key === "y") || (event.key === "z" && event.shiftKey)) {
      event.preventDefault();
      store.redo();
    }
  }
}

onMounted(() => {
  store.requestInitValues();
  window.addEventListener("keydown", onKeyDown);
  if (tableBodyRef.value) {
    scrollTop.value = tableBodyRef.value.scrollTop;
    containerHeight.value = tableBodyRef.value.clientHeight;
    resizeObs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerHeight.value = entry.contentRect.height;
      }
    });
    resizeObs.observe(tableBodyRef.value);
  }
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeyDown);
  if (scrollRaf !== null) {
    cancelAnimationFrame(scrollRaf);
  }
  if (resizeObs) {
    resizeObs.disconnect();
  }
});

const searchKeyword = computed({
  get: () => store.searchString,
  set: (value: string) => {
    store.setSearchString(value);
  }
});

const visibleTree = computed(() => { void collapseTick.value; return filterItemsByVisibility(store.items); });

const filteredTree = computed(() => { void collapseTick.value;
  const tree = visibleTree.value;
  const search = store.debouncedSearchString;
  if (search !== "") {
    const searchStrMatch = /^(?:CONFIG_)?(.+)/.exec(search);
    const normalized =
      searchStrMatch && searchStrMatch.length > 1
        ? searchStrMatch[1].toLowerCase()
        : search.toLowerCase();
    return filterItems(tree, normalized);
  }
  return tree;
});

const choiceChildNames = computed(() => { void collapseTick.value; return collectChoiceChildNames(store.items); });

const displayRows = computed<DisplayRow[]>(() => {
  void collapseTick.value;
  const acc: DisplayRow[] = [];
  buildRows(filteredTree.value, 0, [], false, acc, choiceChildNames.value);
  return acc;
});

const mainTitle = computed(() => deriveTitle(store.items));

// ============ Virtual Scroll ============
const tableBodyRef = ref<HTMLDivElement | null>(null);
const scrollTop = ref(0);
const containerHeight = ref(600);
const ROW_HEIGHT = 36;
const VIRTUAL_BUFFER = 15;
const VIRTUAL_THRESHOLD = 200;
let scrollRaf: number | null = null;
let resizeObs: ResizeObserver | null = null;

const useVirtualScroll = computed(() => displayRows.value.length > VIRTUAL_THRESHOLD);

const virtualStart = computed(() => {
  if (!useVirtualScroll.value) return 0;
  return Math.max(0, Math.floor(scrollTop.value / ROW_HEIGHT) - VIRTUAL_BUFFER);
});

const virtualEnd = computed(() => {
  if (!useVirtualScroll.value) return displayRows.value.length;
  return Math.min(displayRows.value.length, Math.ceil((scrollTop.value + containerHeight.value) / ROW_HEIGHT) + VIRTUAL_BUFFER);
});

const virtualPaddingTop = computed(() => virtualStart.value * ROW_HEIGHT);
const virtualPaddingBottom = computed(() => (displayRows.value.length - virtualEnd.value) * ROW_HEIGHT);

const visibleRows = computed(() => {
  if (!useVirtualScroll.value) return displayRows.value;
  return displayRows.value.slice(virtualStart.value, virtualEnd.value);
});

function onTableScroll() {
  if (scrollRaf !== null) return;
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = null;
    if (tableBodyRef.value) {
      scrollTop.value = tableBodyRef.value.scrollTop;
    }
  });
}

const themeClass = computed(() => {
  if (store.guiThemeOverride) return store.guiThemeOverride === "light" ? "theme-light" : "theme-dark";
  return colorThemeKind.value === "light" ? "theme-light" : "theme-dark";
});

const rootClass = computed(() => `${themeClass.value} anim-${animLevel.value}`);

function deriveTitle(items: Menu[]): string {
  for (const item of items) {
    if (isMainMenu(item)) {
      return item.title || item.name || "Kconfig Configuration";
    }
    if (item.children && item.children.length > 0) {
      const nested = deriveTitle(item.children);
      if (nested) {
        return nested;
      }
    }
  }
  return items[0]?.title || "Kconfig Configuration";
}

function fuzzyMatch(text: string, pattern: string): boolean {
  let pi = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === pattern[pi]) {
      pi++;
      if (pi === pattern.length) return true;
    }
  }
  return false;
}

function filterItems(items: Menu[], searchString: string) {
  const filteredItems: Menu[] = [];
  items.forEach((item) => {
    if (item.isVisible) {
      const nameMatch = item.name && fuzzyMatch(item.name.toLowerCase(), searchString);
      const titleMatch = item.title && fuzzyMatch(item.title.toLowerCase(), searchString);
      if (nameMatch || titleMatch) {
        filteredItems.push(item);
      } else {
        const filteredChildren = filterItems(item.children, searchString);
        if (filteredChildren.length > 0) {
          const newItem = Object.assign({}, item);
          newItem.children = filteredChildren;
          filteredItems.push(newItem);
        }
      }
    }
  });
  return filteredItems;
}

function filterItemsByVisibility(items: Menu[]): Menu[] {
  const visibleItems: Menu[] = [];

  items.forEach((item) => {
    const cloned = { ...item };
    const filteredChildren = item.children
      ? filterItemsByVisibility(item.children)
      : [];

    const isImplicitContainer =
      item.isImplicitContainer &&
      item.isContainerVisible === true &&
      item.isVisible === false;

    if (isImplicitContainer) {
      visibleItems.push(...filteredChildren);
      return;
    }

    const isMainMenu = item.isMainMenu === true;
    const isVisible = item.isVisible !== false;
    const isContainer = item.isContainerVisible === true;

    if (item.children && item.children.length > 0) {
      if (!isVisible && !isContainer && !isMainMenu) {
        return;
      }

      if (filteredChildren.length === 0 && !isVisible && !isMainMenu) {
        return;
      }

      cloned.children = filteredChildren;
      visibleItems.push(cloned);
      return;
    }

    if (isVisible) {
      cloned.children = [];
      visibleItems.push(cloned);
    }
  });

  return visibleItems;
}

function buildRows(
  items: Menu[],
  level: number,
  ancestors: string[],
  ancestorCollapsed: boolean,
  acc: DisplayRow[],
  choiceChildren: Set<string>
) {
  items.forEach((item, index) => {
    const isRootMainMenu = level === 0 && isMainMenu(item);
    if (isRootMainMenu) {
      if (item.children && item.children.length > 0) {
        buildRows(item.children, level, ancestors, ancestorCollapsed, acc, choiceChildren);
      }
      return;
    }

    if (item.name && choiceChildren.has(item.name) && item.type !== menuType.choice) {
      return;
    }

    const id = item.id || `${item.name || "config"}-${level}-${index}`;
    const type = getRowType(item);
    const collapsed = type === "menu" ? computeCollapsed(item) : false;
    const hidden = ancestorCollapsed;

    const row: DisplayRow = {
      id,
      item,
      level,
      type,
      ancestors: [...ancestors],
      collapsed,
      hidden,
      hasChildren: false,
    };
    acc.push(row);

    const beforeChildrenLength = acc.length;
    const childAncestors = type === "menu" ? [...ancestors, id] : ancestors;
    const nextAncestorCollapsed = ancestorCollapsed || (type === "menu" ? collapsed : false);

    if (item.children && item.children.length > 0) {
      if (type === "menu") {
        buildRows(
          item.children,
          level + 1,
          childAncestors,
          nextAncestorCollapsed,
          acc,
          choiceChildren
        );
      } else if (type !== "choice") {
        buildRows(
          item.children,
          level + 1,
          ancestors,
          ancestorCollapsed,
          acc,
          choiceChildren
        );
      }
    }

    if (type === "menu") {
      row.hasChildren = acc.length > beforeChildrenLength;
    }
  });
}

function collectChoiceChildNames(items: Menu[], set: Set<string> = new Set()): Set<string> {
  items.forEach(item => {
    if (item.type === menuType.choice && item.children) {
      item.children.forEach(child => {
        if (child.name) {
          set.add(child.name);
        }
      });
    }
    if (item.children && item.children.length > 0) {
      collectChoiceChildNames(item.children, set);
    }
  });
  return set;
}

function getRowType(item: Menu): RowType {
  if (item.type === menuType.choice) {
    return "choice";
  }

  if (item.type === menuType.menu || item.isMenuconfig) {
    return "menu";
  }

  switch (item.type) {
    case menuType.bool:
      return "bool";
    case menuType.tristate:
      return "tristate";
    case menuType.string:
      return "string";
    case menuType.int:
      return "int";
    case menuType.hex:
      return "hex";
    case menuType.comment:
      return "comment";
    default:
      return item.type === "comment" ? "comment" : "other";
  }
}

function computeCollapsed(item: Menu): boolean {
  if (isMainMenu(item)) return false;
  // Menuconfig entries: always expanded, children visibility is controlled by the toggle switch
  if (item.isMenuconfig) return false;
  if (typeof item.isCollapsed === "boolean") return item.isCollapsed;
  return item.type === menuType.menu ? true : false;
}

function isMainMenu(item: Menu): boolean {
  if (item.isMainMenu === true) {
    return true;
  }
  const id = item.id || "";
  if (typeof id === "string" && id.startsWith("mainmenu-")) {
    return true;
  }
  return item.name === "__MAINMENU__";
}

const splashProgressPercent = computed(() => {
  if (initialLoadChunkTotal.value <= 0) return 0;
  return Math.min(100, Math.round((initialLoadChunkReceived.value / initialLoadChunkTotal.value) * 100));
});

const splashStatusText = computed(() => {
  if (initialLoadChunkTotal.value > 0) {
    return `${t('splash.loadingProgress')} ${initialLoadChunkReceived.value} / ${initialLoadChunkTotal.value}`;
  }
  return t('splash.initializing');
});

function handleCollapseUpdate(id: string, value: boolean) {
  store.setMenuCollapseById(id, value);
  if (value) store.closeAllHelp();
  collapseTick.value++;
}

function retryLoading() {
  store.clearInitialLoadError();
  store.requestInitValues();
}
</script>

<template>
  <div class="modern-app" :class="rootClass">
    <!-- ============ SPLASH SCREEN ============ -->
    <Transition name="splash-fade">
      <div v-if="initialLoadInProgress || initialLoadError" class="splash-overlay">
        <div class="splash-glow"></div>
        <div class="splash-content">
          <div class="splash-logo-wrap">
            <svg class="splash-logo" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M 2 1 L 30 1 L 30 30 L 18 30 L 18 14 L 2 14 L 2 1 Z" />
              <path fill="currentColor" d="M 2 18 L 14 18 L 14 30 L 2 30 L 2 18 Z" />
            </svg>
          </div>
          <div class="splash-brand">IMDE</div>
          <div class="splash-sub">GUI CONFIG</div>
          <template v-if="initialLoadError">
            <div class="splash-error">
              <span class="splash-error-icon">!</span>
              <span class="splash-error-text">{{ initialLoadError }}</span>
            </div>
            <button class="splash-retry-btn" type="button" @click="retryLoading">
              {{ t('splash.retry') }}
            </button>
          </template>
          <template v-else>
            <div class="splash-progress-track">
              <div class="splash-progress-bar" :style="{ width: `${splashProgressPercent}%` }"></div>
            </div>
            <div class="splash-status">
              <span class="splash-status-dot"></span>
              <span>{{ splashStatusText }}</span>
            </div>
          </template>
        </div>
      </div>
    </Transition>

    <header class="modern-header">
      <div class="header-left">
        <div class="brand">
          <svg class="brand-logo" width="28" height="28" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M 2 1 L 30 1 L 30 30 L 18 30 L 18 14 L 2 14 L 2 1 Z" />
            <path fill="currentColor" d="M 2 18 L 14 18 L 14 30 L 2 30 L 2 18 Z" />
          </svg>
          <div class="brand-text">
            <span class="brand-name">IMDE</span>
            <span class="brand-sub">GUI CONFIG</span>
          </div>
        </div>
      </div>
      <div class="header-center">
        <div class="search-group">
          <input
            v-model="searchKeyword"
            type="text"
            class="search-input"
            :placeholder="t('search.placeholder')"
          />
          <div class="toolbar-divider" />
          <div class="toolbar-group">
            <button
              class="toolbar-button"
              type="button"
              :disabled="!store.canUndo"
              @click="store.undo"
              :title="t('toolbar.undo')"
            >
              &#x21B6;
            </button>
            <button
              class="toolbar-button"
              type="button"
              :disabled="!store.canRedo"
              @click="store.redo"
              :title="t('toolbar.redo')"
            >
              &#x21B7;
            </button>
            <button
              class="toolbar-button"
              type="button"
              @click="store.expandAllMenus"
              :title="t('toolbar.expandAll')"
            >
              <IconChevronDown />
            </button>
            <button
              class="toolbar-button"
              type="button"
              @click="store.collapseAllMenus"
              :title="t('toolbar.collapseAll')"
            >
              <IconChevronUp />
            </button>
            <button
              class="toolbar-button theme-toggle-btn"
              type="button"
              @click="store.toggleGuiTheme"
              :title="(store.guiThemeOverride || colorThemeKind) === 'light' ? t('theme.switchToDark') : t('theme.switchToLight')"
            >
              {{ (store.guiThemeOverride || colorThemeKind) === 'light' ? '☀' : '☾' }}
            </button>
            <button
              class="toolbar-button"
              type="button"
              @click="store.closeAllHelp"
              :title="t('toolbar.closeAllHelp')"
            >
              <IconEyeClosed />
            </button>
            <button
              class="toolbar-button refresh-btn"
              type="button"
              @click="store.refreshConfig"
              :title="t('toolbar.refresh')"
            >
              <IconRefresh />
            </button>
          </div>
        </div>
      </div>
      <div class="header-right">
        <button class="header-btn primary" type="button" @click="store.saveGuiConfig">
          <svg class="btn-svg" width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 2v12h12V4.83L11.17 2H2zm1 1h7.59L13 5.41V13H3V3zm2 8v2h6v-2H5zm0-3v2h6V8H5z" fill="currentColor"/></svg>
          <span>{{ textDictionary.apply }}</span>
        </button>
        <button class="header-btn" type="button" @click="store.saveGuiConfigAs">
          <span class="btn-icon">&#x1F4C1;</span>
          <span>{{ textDictionary.save }}</span>
        </button>
        <button class="header-btn" type="button" @click="store.resetGuiConfig">
          <span class="btn-icon">&#x1F5D1;</span>
          <span>{{ textDictionary.discard }}</span>
        </button>
        <button class="header-btn" type="button" @click="store.setDefaultConfig">
          <span class="btn-icon">&#x27F2;</span>
          <span>{{ textDictionary.reset }}</span>
        </button>
      </div>
    </header>

    <div class="table-wrapper">
      <div class="table-header">
        <div class="table-header-cell property-col">Property</div>
        <div class="table-header-cell value-col">Value</div>
      </div>
      <div class="table-body" ref="tableBodyRef" @scroll="onTableScroll">
        <template v-if="useVirtualScroll">
          <div
            :style="{
              paddingTop: `${virtualPaddingTop}px`,
              paddingBottom: `${virtualPaddingBottom}px`,
            }"
          >
            <TableRow
              v-for="row in visibleRows"
              :key="row.id"
              :row="row"
              :collapsed="row.collapsed"
              :hidden="row.hidden"
              @update-collapse="handleCollapseUpdate"
            />
          </div>
        </template>
        <template v-else>
          <TableRow
            v-for="row in displayRows"
            :key="row.id"
            :row="row"
            :collapsed="row.collapsed"
            :hidden="row.hidden"
            @update-collapse="handleCollapseUpdate"
          />
        </template>
      </div>
    </div>

    <ConfirmDialog
      :visible="store.showDiscardConfirm"
      :title="t('discard.confirmTitle')"
      :message="t('discard.confirmMessage')"
      :confirm-text="t('common.confirm')"
      :cancel-text="t('common.cancel')"
      @confirm="store.confirmDiscard"
      @cancel="store.cancelDiscard"
    />

    <ConfirmDialog
      :visible="store.showResetConfirm"
      :title="t('reset.confirmTitle')"
      :message="t('reset.confirmMessage')"
      :confirm-text="t('common.confirm')"
      :cancel-text="t('common.cancel')"
      @confirm="store.confirmReset"
      @cancel="store.cancelReset"
    />

    <PerformanceMonitor ref="perfMonitorRef" :row-count="displayRows.length" />
  </div>
</template>

<style scoped lang="scss">
@import "../../../commons/commons.scss";


.modern-app {
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  width: 100%;
  height: 100vh;
  min-height: 0;
  font-family: var(--font-family);
  font-size: var(--font-size);
  font-weight: var(--font-weight);
  transition: background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.modern-app.theme-dark {
  --bg-primary: #1a1a2e;
  --bg-secondary: #16162a;
  --bg-tertiary: #1e1e34;
  --bg-hover: #252545;
  --bg-selected: rgba(212, 96, 158, 0.15);
  --border-color: #2a2a45;
  --text-primary: #e4e4f0;
  --text-secondary: #a0a0c0;
  --text-muted: #6a6a88;
  --accent-blue: #d4609e;
  --button-bg: #b04070;
  --button-hover: #d4609e;
  --input-bg: #1e1e38;
  --input-border: #3a3a55;
  --input-focus: #d4609e;
  --font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  --font-size: 13px;
  --font-weight: 400;
  --logo-color: #f0a0c8;
}

.modern-app.theme-light {
  --bg-primary: #f5f6fa;
  --bg-secondary: #ffffff;
  --bg-tertiary: #f0f2f8;
  --bg-hover: #e8edf8;
  --bg-selected: rgba(0, 0, 128, 0.08);
  --border-color: #d8dce6;
  --text-primary: #1a1a2e;
  --text-secondary: #4a4a6a;
  --text-muted: #8a8aa8;
  --accent-blue: #000080;
  --button-bg: #000080;
  --button-hover: #000060;
  --input-bg: #ffffff;
  --input-border: #c8ccd6;
  --input-focus: #000080;
  --font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  --font-size: 13px;
  --font-weight: 400;
  --logo-color: #000080;
}

.modern-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  gap: 16px;
  animation: headerSlideDown 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-left {
  flex: 0 0 auto;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-logo {
  color: var(--logo-color);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.5px;
}

.brand-sub {
  font-size: 10px;
  font-weight: 600;
  color: var(--accent-blue);
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.search-group {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 420px;
}

.search-input {
  flex: 1;
  padding: 6px 12px;
  background-color: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 4px;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.15s ease-in-out;
}

.search-input:focus {
  border-color: var(--input-focus);
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.toolbar-divider {
  width: 1px;
  height: 26px;
  background-color: var(--border-color);
  flex-shrink: 0;
}

.toolbar-group {
  display: flex;
  gap: 6px;
  align-items: center;
}

.toolbar-button {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.toolbar-button:hover,
.toolbar-button:focus-visible {
  background-color: var(--bg-hover);
  border-color: var(--border-color);
}

.toolbar-button:active {
  transform: scale(0.9);
}

.toolbar-button {
  transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
}

.refresh-btn {
  margin-left: 2px;
  border-left: 1px solid var(--border-color) !important;
  padding-left: 6px;
  border-radius: 0 4px 4px 0 !important;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.header-btn:hover {
  background-color: var(--bg-hover);
}

.header-btn:active {
  transform: scale(0.97);
}

.header-btn.primary {
  background-color: var(--button-bg);
  border-color: var(--button-bg);
  color: #ffffff;
}

.header-btn.primary:hover {
  background-color: var(--button-hover);
}

.header-btn.primary:active {
  transform: scale(0.97);
}

.btn-icon {
  font-size: 12px;
  line-height: 12px;
}

.table-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  min-height: 0;
  animation: contentReveal 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.15s both;
}

.table-header {
  display: flex;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 5;
}

.table-header-cell {
  padding: 8px 12px;
  font-weight: 600;
  color: var(--text-primary);
  border-right: 1px solid var(--border-color);
}

.table-header-cell.property-col {
  flex: 1;
}

.table-header-cell.value-col {
  flex: 2;
  min-width: 180px;
}

.table-body {
  flex: 1;
  overflow-y: auto;
  background-color: var(--bg-primary);
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
}

.table-body::-webkit-scrollbar {
  width: 6px;
}

.table-body::-webkit-scrollbar-track {
  background: transparent;
}

.table-body::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 3px;
}

.table-body::-webkit-scrollbar-thumb:hover {
  background-color: var(--text-muted);
}

/* =============================================
   Adaptive Animation Levels
   ============================================= */
.modern-app.anim-medium .table-row,
.modern-app.anim-low .table-row {
  animation: none;
}

.modern-app.anim-medium .splash-logo {
  animation-duration: 0.4s;
}

.modern-app.anim-low .splash-logo,
.modern-app.anim-low .splash-brand,
.modern-app.anim-low .splash-sub,
.modern-app.anim-low .splash-progress-track,
.modern-app.anim-low .splash-status {
  animation: none;
  opacity: 1;
}

.modern-app.anim-low .modern-header {
  animation: none;
}

.modern-app.anim-low .table-wrapper {
  animation: none;
}

.modern-app.anim-low .help-row {
  animation: none;
}

.modern-app.anim-low * {
  transition-duration: 0.05s !important;
}

/* =============================================
   Splash Screen
   ============================================= */
.splash-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-primary);
  overflow: hidden;
}

.splash-glow {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--accent-blue) 0%, transparent 70%);
  opacity: 0.05;
  animation: splashGlow 4s ease-in-out infinite;
  pointer-events: none;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 1;
}

.splash-logo-wrap {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.splash-logo {
  width: 100%;
  height: 100%;
  color: var(--logo-color);
  animation: splashLogoEntry 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.splash-brand {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: 3px;
  opacity: 0;
  animation: splashTextReveal 0.8s ease-out 0.8s forwards;
}

.splash-sub {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-blue);
  letter-spacing: 6px;
  text-transform: uppercase;
  opacity: 0;
  animation: splashSubReveal 0.6s ease-out 1.3s forwards;
}

.splash-progress-track {
  width: 180px;
  height: 3px;
  background-color: var(--border-color);
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
  opacity: 0;
  animation: splashSubReveal 0.5s ease-out 1.7s forwards;
}

.splash-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-blue), var(--button-hover));
  border-radius: 2px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  background-size: 200% 100%;
  animation: splashProgressShimmer 2s linear infinite;
}

.splash-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 4px;
  opacity: 0;
  animation: splashSubReveal 0.5s ease-out 1.9s forwards;
}

.splash-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--accent-blue);
  animation: splashStatusPulse 1.5s ease-in-out infinite;
}

.splash-error {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 14px;
  border-radius: 6px;
  background-color: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  max-width: 320px;
}

.splash-error-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #f44336;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.splash-error-text {
  font-size: 12px;
  color: var(--text-primary);
  line-height: 1.4;
}

.splash-retry-btn {
  margin-top: 12px;
  padding: 8px 24px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.splash-retry-btn:hover {
  background-color: var(--bg-hover);
  border-color: var(--accent-blue);
}

.splash-retry-btn:active {
  transform: scale(0.97);
}

.splash-fade-enter-active {
  animation: fadeIn 0.4s ease-out;
}

.splash-fade-leave-active {
  animation: fadeIn 0.6s ease-in reverse;
}
</style>
