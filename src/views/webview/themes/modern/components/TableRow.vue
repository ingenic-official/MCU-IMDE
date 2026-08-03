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
import { computed, ref, watch, onUnmounted, inject } from "vue";
import { storeToRefs } from "pinia";
import { useMenuconfigStore } from "../../../store";
import { t } from "../../../i18n";
import type { DisplayRow } from "../types";
import type { Menu } from "../../../../../menuconfig/Menu";
import { useTristate } from "./useTristate";
import { useChoiceWidth } from "./useChoiceWidth";

const props = defineProps<{
  row: DisplayRow;
  collapsed: boolean;
  hidden: boolean;
}>();

const emit = defineEmits<{
  (event: "updateCollapse", id: string, value: boolean): void;
}>();

const store = useMenuconfigStore();
const { closeAllHelpTimestamp } = storeToRefs(store);
const animLevel = inject("animLevel", computed(() => "high"));
const isLowPerf = computed(() => animLevel.value === "low");
const transitionDelay = computed(() => {
  if (isLowPerf.value) return "0s";
  return `${Math.min(props.row.level * 0.015, 0.08)}s`;
});

const isMenuRow = computed(() => props.row.type === "menu");
const isChoiceRow = computed(() => props.row.type === "choice");
const isBoolRow = computed(() => props.row.type === "bool");
const isTristateRow = computed(() => props.row.type === "tristate");
const isStringRow = computed(() => props.row.type === "string");
const isIntRow = computed(() => props.row.type === "int");
const isHexRow = computed(() => props.row.type === "hex");
const isCommentRow = computed(() => props.row.type === "comment");
const isMenuConfig = computed(() => props.row.item.isMenuconfig === true);

const canToggleMenu = computed(() => {
  if (!isMenuRow.value) {
    return false;
  }
  // Menuconfig entries: always expanded, no toggle button
  if (isMenuConfig.value) {
    return false;
  }
  return props.row.hasChildren === true;
});

const isReadonly = computed(() => props.row.item.isReadonly === true);

const {
  allowedTriOptions, triSelectOptions, isTriSelectDisabled,
  triValue, normalizeTriValue, ensureTriValueAllowed,
} = useTristate(computed(() => props.row.item), isReadonly);
const readonlyReason = computed(() => props.row.item.readonlyReason || "");

const propertyLabel = computed(() => props.row.item.title || props.row.item.name || props.row.id);

const indentStyle = computed(() => ({
  paddingLeft: `${props.row.level * 20 + (isMenuRow.value ? 4 : 28)}px`,
}));

const helpIndentStyle = computed(() => ({
  paddingLeft: `${props.row.level * 20 + 32}px`,
}));

const hasHelp = computed(() => {
  // Only show ? when there's meaningful detail to display
  if (isMenuRow.value || isCommentRow.value) return false;
  const item = props.row.item as any;
  return !!(
    item.help ||
    item.prompt ||
    item.directDepExpr ||
    item.effectiveDepExpr ||
    item.dependsOn ||
    item.menuPath ||
    (item.sourceFile && item.linenr) ||
    (item.range && item.range.length >= 2) ||
    (item.defaults && item.defaults.length > 0) ||
    (item.select && item.select.length > 0) ||
    (item.selectedBy && item.selectedBy.length > 0) ||
    (item.implies && item.implies.length > 0)
  );
});

const helpVisible = ref(false);
watch(closeAllHelpTimestamp, () => {
  helpVisible.value = false;
});

const collapsed = ref(props.collapsed);
const valueJustChanged = ref(false);
let valueFlashTimer: ReturnType<typeof setTimeout> | null = null;

function triggerValueFlash() {
  if (valueFlashTimer) {
    clearTimeout(valueFlashTimer);
  }
  valueJustChanged.value = true;
  valueFlashTimer = setTimeout(() => {
    valueJustChanged.value = false;
  }, 600);
}

function updateCollapseState(
  value: boolean,
  options: { emit?: boolean } = {}
) {
  const { emit: shouldEmit = true } = options;
  collapsed.value = value;
  if (shouldEmit) {
    emit("updateCollapse", props.row.id, value);
  }
}

watch(
  () => props.collapsed,
  (value) => {
    updateCollapseState(value, { emit: false });
  }
);

const expandIcon = computed(() => {
  return "▶";
});

const boolValue = ref(toBoolean(props.row.item.value));
watch(
  () => props.row.item.value,
  (value) => {
    boolValue.value = toBoolean(value);
    if (isMenuConfig.value && !boolValue.value) {
      updateCollapseState(true);
    }
  }
);


const stringValue = ref(toStringValue(props.row.item.value));
watch(
  () => props.row.item.value,
  (value) => {
    stringValue.value = toStringValue(value);
  }
);

const numberValue = ref(toNumberValue(props.row.item.value));
watch(
  () => props.row.item.value,
  (value) => {
    numberValue.value = toNumberValue(value);
  }
);

const hexValue = ref(toHexValue(props.row.item.value));
watch(
  () => props.row.item.value,
  (value) => {
    hexValue.value = toHexValue(value);
  }
);

const choiceValue = ref(toChoiceValue(props.row.item.value));
watch(
  () => props.row.item.value,
  (value) => {
    choiceValue.value = toChoiceValue(value);
  }
);

const choiceOptions = computed<Array<{ id: string; name: string; title: string }>>(() => {
  return (props.row.item.children || []).map((child: Menu) => ({
    id: child.id,
    name: child.name,
    title: child.title || child.name
  }));
});

const { choiceSelectRef, choiceSelectWidth } = useChoiceWidth(isChoiceRow, computed(() => props.row.item));

const rangeMin = computed(() => props.row.item.range?.[0]);
const rangeMax = computed(() => props.row.item.range?.[1]);
const hasRange = computed(() => rangeMin.value !== undefined && rangeMax.value !== undefined);
const rangeText = computed(() => {
  if (!hasRange.value) {
    return "";
  }
  if (isHexRow.value) {
    return `${formatHexNumber(rangeMin.value)} .. ${formatHexNumber(rangeMax.value)}`;
  }
  return `${rangeMin.value} .. ${rangeMax.value}`;
});
const defaultRows = computed(() => {
  const defaults = props.row.item.defaults || [];
  return defaults.map((entry: { value: unknown; condition?: string }) => ({
    value: formatDisplayValue(entry.value),
    condition: entry.condition || "",
  }));
});

onUnmounted(() => {
  if (valueFlashTimer) {
    clearTimeout(valueFlashTimer);
    valueFlashTimer = null;
  }
});

function toggleHelp() {
  helpVisible.value = !helpVisible.value;
  if (helpVisible.value) {
    store.requestMenuDetail(props.row.item.id || props.row.id);
  }
}

function toggleMenu() {
  if (!canToggleMenu.value) {
    return;
  }
  const next = !collapsed.value;
  updateCollapseState(next);
}

function onPropertyContentClick(event: MouseEvent) {
  if (!isMenuRow.value) {
    return;
  }

  if (!canToggleMenu.value) {
    return;
  }

  const target = event.target as HTMLElement | null;
  if (target?.closest(".expand-icon, .help-icon, .toggle-switch")) {
    return;
  }

  event.stopPropagation();
  toggleMenu();
}

function onMenuConfigToggle(event: Event) {
  if (isReadonly.value) {
    (event.target as HTMLInputElement).checked = boolValue.value;
    return;
  }
  const value = (event.target as HTMLInputElement).checked;
  boolValue.value = value;
  updateValue(value);
  if (value) {
    updateCollapseState(false);
  } else {
    updateCollapseState(true);
  }
}

function onBooleanToggle(event: Event) {
  if (isReadonly.value) {
    (event.target as HTMLInputElement).checked = boolValue.value;
    return;
  }
  const value = (event.target as HTMLInputElement).checked;
  boolValue.value = value;
  updateValue(value);
}

function onTriValueChange(event: Event) {
  if (isTriSelectDisabled.value) {
    event.preventDefault();
    triValue.value = ensureTriValueAllowed(normalizeTriValue(props.row.item.value));
    return;
  }
  const target = event.target as HTMLSelectElement;
  const next = ensureTriValueAllowed(normalizeTriValue(target.value));
  const current = ensureTriValueAllowed(normalizeTriValue(props.row.item.value));
  if (next !== triValue.value) {
    triValue.value = next;
  }
  if (next !== current) {
    updateValue(next);
  }
}

function onStringInput(event: Event) {
  const target = event.target as HTMLInputElement | null;
  if (!target) {
    return;
  }
  stringValue.value = target.value;
}

function onStringCommit(event?: Event) {
  if (isReadonly.value) {
    stringValue.value = toStringValue(props.row.item.value);
    return;
  }
  const inputValue = (() => {
    const target = event?.target as HTMLInputElement | null;
    return target ? target.value : stringValue.value;
  })();
  stringValue.value = inputValue;
  updateValue(inputValue);
}

function onNumberCommit(event?: Event) {
  if (isReadonly.value) {
    numberValue.value = toNumberValue(props.row.item.value);
    return;
  }
  const target = event?.target as HTMLInputElement | undefined;
  const eventValue = target ? target.value : String(numberValue.value);
  const trimmed = eventValue.trim();
  if (!trimmed) {
    const fallback = toNumberValue(props.row.item.value);
    numberValue.value = fallback;
    if (target) {
      target.value = String(fallback);
    }
    if (toNumberValue(props.row.item.value) !== fallback) {
      updateValue(fallback);
    }
    return;
  }
  let value = Number.parseInt(trimmed, 10);
  if (Number.isNaN(value)) {
    value = toNumberValue(props.row.item.value);
  }
  if (rangeMin.value !== undefined) {
    value = Math.max(value, rangeMin.value);
  }
  if (rangeMax.value !== undefined) {
    value = Math.min(value, rangeMax.value);
  }
  numberValue.value = value;
  if (toNumberValue(props.row.item.value) !== value) {
    updateValue(value);
  }
}

function onNumberStep(delta: number) {
  if (isReadonly.value) {
    return;
  }
  let value = Number(numberValue.value) + delta;
  if (rangeMin.value !== undefined) {
    value = Math.max(value, rangeMin.value);
  }
  if (rangeMax.value !== undefined) {
    value = Math.min(value, rangeMax.value);
  }
  numberValue.value = value;
  updateValue(value);
}

function onHexCommit(event?: Event) {
  if (isReadonly.value) {
    hexValue.value = toHexValue(props.row.item.value);
    return;
  }
  const target = event?.target as HTMLInputElement | undefined;
  const eventValue = target ? target.value : hexValue.value;
  const formatted = formatHexString(eventValue);
  hexValue.value = formatted;
  if (target && target.value !== formatted) {
    target.value = formatted;
  }
  if (toHexValue(props.row.item.value) !== formatted) {
    updateValue(formatted);
  }
}

function onHexStep(delta: number) {
  if (isReadonly.value) {
    return;
  }
  const current = toNumericHex(hexValue.value);
  if (!Number.isFinite(current)) {
    return;
  }
  let next = current + delta;
  if (rangeMin.value !== undefined) {
    next = Math.max(next, rangeMin.value);
  }
  if (rangeMax.value !== undefined) {
    next = Math.min(next, rangeMax.value);
  }
  if (next < 0) {
    next = 0;
  }
  const formatted = formatHexString(next.toString(16));
  hexValue.value = formatted;
  updateValue(formatted);
}

function onChoiceChange(event: Event) {
  if (isReadonly.value) {
    event.preventDefault();
    choiceValue.value = toChoiceValue(props.row.item.value);
    return;
  }
  const value = (event.target as HTMLSelectElement).value;
  choiceValue.value = value;
  updateValue(value);
}

function updateValue(value: any) {
  const oldValue = props.row.item.value;
  const updated = {
    ...props.row.item,
    value,
    lastModified: Date.now(),
  } as Menu;
  props.row.item.value = value;
  store.recordValueChange(props.row.item.id || props.row.item.name, props.row.item.name || "", oldValue, value);
  store.sendNewValue(updated);
  triggerValueFlash();
}

function toBoolean(value: any): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (value === "y" || value === "Y" || value === 1 || value === "1") {
    return true;
  }
  return false;
}

function toStringValue(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

function toNumberValue(value: any): number {
  if (typeof value === "number") {
    return value;
  }
  const parsed = parseInt(String(value), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function toHexValue(value: any): string {
  if (typeof value === "string" && /^0x[0-9a-fA-F]+$/.test(value)) {
    return value.toLowerCase();
  }
  if (typeof value === "number") {
    return `0x${value.toString(16)}`;
  }
  const parsed = parseInt(String(value), 16);
  if (!Number.isNaN(parsed)) {
    return `0x${parsed.toString(16)}`;
  }
  return "0x0";
}

function formatHexString(raw: string): string {
  let text = raw.trim();
  if (!text) {
    return toHexValue(props.row.item.value);
  }
  if (!text.startsWith("0x") && !text.startsWith("0X")) {
    text = `0x${text}`;
  }
  if (!/^0x[0-9a-fA-F]+$/.test(text)) {
    return toHexValue(props.row.item.value);
  }
  return text.toLowerCase();
}

function toChoiceValue(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object" && value !== null && "name" in value) {
    return String((value as { name: string }).name);
  }
  return String(value);
}

function toNumericHex(value: string): number {
  const text = value.trim();
  if (!text) {
    return 0;
  }
  const normalized = text.startsWith("0x") || text.startsWith("0X") ? text : `0x${text}`;
  const parsed = parseInt(normalized, 16);
  return Number.isNaN(parsed) ? NaN : parsed;
}

function formatHexNumber(value: unknown): string {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return String(value ?? "");
  }
  const sign = parsed < 0 ? "-" : "";
  return `${sign}0x${Math.abs(parsed).toString(16)}`;
}

function formatDisplayValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "(empty)";
  }
  if (typeof value === "boolean") {
    return value ? "y" : "n";
  }
  return String(value);
}
</script>

<template>
  <div
    class="table-row"
    :class="[
      { 'menu-row': isMenuRow, 'comment-row': isCommentRow, readonly: isReadonly },
      { collapsed },
      { 'row-hidden': hidden },
      { 'value-flash': valueJustChanged && !isLowPerf },
      { 'no-anim': isLowPerf }
    ]"
    :style="{ '--transition-delay': transitionDelay }"
  >
    <template v-if="isCommentRow">
      <div class="table-cell comment-full-col">
        <div class="comment-content" :style="indentStyle">
          <span class="comment-stars">***</span>
          <span class="comment-text">{{ props.row.item.title || props.row.item.prompt }}</span>
          <span class="comment-stars">***</span>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="table-cell property-col">
        <div
          class="property-content"
          :class="{ 'menu-clickable': isMenuRow }"
          :style="indentStyle"
          @click="onPropertyContentClick"
        >
          <button
            v-if="isMenuRow"
            class="expand-icon"
            type="button"
            :class="{ 'is-expanded': isMenuConfig ? boolValue : !collapsed }"
            :aria-expanded="canToggleMenu ? !collapsed : undefined"
            :disabled="!canToggleMenu"
            @click.stop="toggleMenu"
          >
            {{ expandIcon }}
          </button>
          <span class="property-name">{{ propertyLabel }}</span>
          <span v-if="isReadonly" class="readonly-tag" :title="readonlyReason">{{ t('row.readonlyTag') }}</span>
          <button v-if="hasHelp" class="help-icon" type="button" @click.stop="toggleHelp">?</button>
        </div>
      </div>
      <div class="table-cell value-col">
        <template v-if="isMenuRow">
          <label v-if="isMenuConfig" class="toggle-switch">
            <input
              type="checkbox"
              :checked="boolValue"
              :disabled="isReadonly"
              @change="onMenuConfigToggle"
            />
            <span class="toggle-slider"></span>
          </label>
        </template>
        <template v-else-if="isBoolRow">
          <label class="toggle-switch">
            <input
              type="checkbox"
              :checked="boolValue"
              :disabled="isReadonly"
              @change="onBooleanToggle"
            />
            <span class="toggle-slider"></span>
          </label>
        </template>
        <template v-else-if="isTristateRow">
          <select
            class="select-input"
            :value="triValue"
            :disabled="isTriSelectDisabled"
            @change="onTriValueChange"
          >
            <option
              v-for="option in triSelectOptions"
              :key="option.value"
              :value="option.value"
              :disabled="option.disabled"
            >
              {{ option.value }}
            </option>
          </select>
        </template>
        <template v-else-if="isIntRow">
          <div class="number-input-wrapper">
            <input
              class="text-input number-input"
              type="number"
              :min="rangeMin"
              :max="rangeMax"
              :value="numberValue"
              :disabled="isReadonly"
              @change="onNumberCommit($event)"
              @blur="onNumberCommit($event)"
              @keydown.enter.prevent="onNumberCommit($event)"
            />
            <div class="number-arrows">
              <button type="button" @click="onNumberStep(1)" :disabled="isReadonly">▲</button>
              <button type="button" @click="onNumberStep(-1)" :disabled="isReadonly">▼</button>
            </div>
          </div>
        </template>
        <template v-else-if="isHexRow">
          <div class="hex-input-wrapper">
            <input
              class="text-input hex-input"
              type="text"
              :value="hexValue"
              :disabled="isReadonly"
              @change="onHexCommit($event)"
              @blur="onHexCommit($event)"
              @keydown.enter.prevent="onHexCommit($event)"
            />
            <div class="number-arrows">
              <button type="button" @click="onHexStep(1)" :disabled="isReadonly">▲</button>
              <button type="button" @click="onHexStep(-1)" :disabled="isReadonly">▼</button>
            </div>
          </div>
        </template>
        <template v-else-if="isStringRow">
          <input
            class="text-input string-input"
            type="text"
            :value="stringValue"
            :disabled="isReadonly"
            @input="onStringInput"
            @change="onStringCommit"
            @blur="onStringCommit"
          />
        </template>
        <template v-else-if="isChoiceRow">
          <select
            class="select-input"
            ref="choiceSelectRef"
            :value="choiceValue"
            :disabled="isReadonly"
            @change="onChoiceChange"
            :style="{ width: choiceSelectWidth, maxWidth: '100%' }"
          >
            <option
              v-for="option in choiceOptions"
              :key="option.id || option.name"
              :value="option.name"
            >
              {{ option.title }}
            </option>
          </select>
        </template>
        <template v-else>
          <span class="plain-value">{{ props.row.item.value }}</span>
        </template>
      </div>
    </template>
  </div>
  <div v-if="helpVisible && hasHelp" class="help-row" :style="helpIndentStyle">
    <p><strong>Name:</strong> {{ props.row.item.name }}</p>
    <p v-if="props.row.item.prompt"><strong>Prompt:</strong> {{ props.row.item.prompt }}</p>
    <p><strong>Type:</strong> {{ props.row.item.type }}</p>
    <p v-if="hasRange"><strong>Range:</strong> {{ rangeText }}</p>
    <p v-if="props.row.item.directDepExpr"><strong>Direct depends on:</strong> {{ props.row.item.directDepExpr }}</p>
    <p v-if="props.row.item.directDepValue"><strong>Direct dependency state:</strong> {{ props.row.item.directDepValue }}</p>
    <p v-if="props.row.item.effectiveDepExpr"><strong>Effective visibility:</strong> {{ props.row.item.effectiveDepExpr }}</p>
    <p v-if="props.row.item.effectiveDepValue"><strong>Effective state:</strong> {{ props.row.item.effectiveDepValue }}</p>
    <p v-if="props.row.item.menuPath"><strong>Menu path:</strong> {{ props.row.item.menuPath }}</p>
    <p v-if="props.row.item.sourceFile && props.row.item.linenr">
      <strong>Location:</strong> {{ props.row.item.sourceFile }}:{{ props.row.item.linenr }}
    </p>
    <div v-if="defaultRows.length" class="help-section">
      <strong>Defaults:</strong>
      <ul>
        <li v-for="(entry, index) in defaultRows" :key="index">
          {{ entry.value }}<span v-if="entry.condition"> if {{ entry.condition }}</span>
        </li>
      </ul>
    </div>
    <p v-if="props.row.item.selectInfo"><strong>Selects:</strong> {{ props.row.item.selectInfo }}</p>
    <p v-if="props.row.item.selectedByInfo"><strong>Selected by:</strong> {{ props.row.item.selectedByInfo }}</p>
    <p v-if="props.row.item.implyInfo"><strong>Implies:</strong> {{ props.row.item.implyInfo }}</p>
    <div v-if="props.row.item.help" class="help-content" v-html="props.row.item.help"></div>
    <div v-if="props.row.item.sourceFiles && props.row.item.sourceFiles.length">
      <strong>Includes:</strong>
      <ul>
        <li v-for="(file, index) in props.row.item.sourceFiles" :key="index">{{ file }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "./TableRow.scss";
</style>
