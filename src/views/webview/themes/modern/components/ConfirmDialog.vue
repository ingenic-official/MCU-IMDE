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
import { t } from "../../../i18n";

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

function onConfirm() {
  emit('confirm');
}

function onCancel() {
  emit('cancel');
}

function onOverlayClick(event: Event) {
  if (event.target === event.currentTarget) {
    onCancel();
  }
}
</script>

<template>
  <div v-if="visible" class="dialog-overlay" @click="onOverlayClick">
    <div class="dialog-content">
      <div class="dialog-header">
        <h3>{{ title }}</h3>
      </div>
      <div class="dialog-body">
        <p>{{ message }}</p>
      </div>
      <div class="dialog-footer">
        <button class="vscode-button primary" @click="onConfirm">
          {{ confirmText || t('common.confirm') }}
        </button>
        <button class="vscode-button" @click="onCancel">
          {{ cancelText || t('common.cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
  backdrop-filter: blur(2px);
}

.dialog-content {
  background-color: var(--vscode-dropdown-background);
  border: 1px solid var(--vscode-dropdown-border);
  border-radius: 8px;
  min-width: 400px;
  max-width: 600px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 91, 172, 0.1);
  animation: fadeInUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dialog-header {
  padding: 20px 24px 0 24px;
}

.dialog-header h3 {
  margin: 0 0 16px 0;
  color: var(--vscode-foreground);
  font-size: 16px;
  font-weight: 600;
  border-left: 3px solid var(--accent-blue);
  padding-left: 12px;
}

.dialog-body {
  padding: 8px 24px 20px 24px;
}

.dialog-body p {
  margin: 0;
  color: var(--vscode-foreground);
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.85;
}

.dialog-footer {
  padding: 0 24px 20px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.vscode-button {
  height: 32px;
  padding: 0 18px;
  font-size: 13px;
  line-height: 32px;
  font-weight: 500;
  color: var(--vscode-button-foreground);
  background-color: var(--vscode-button-secondaryBackground, var(--vscode-button-background));
  border: 1px solid var(--vscode-button-border, transparent);
  border-radius: 6px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid var(--accent-blue);
    outline-offset: 2px;
  }
}

.vscode-button.primary {
  color: #ffffff;
  background-color: var(--button-bg);
  border-color: var(--button-bg);

  &:hover {
    background-color: var(--button-hover);
    border-color: var(--button-hover);
    box-shadow: 0 4px 14px rgba(0, 0, 128, 0.35);
  }

  &:active {
    background-color: var(--brand-blue-dark);
  }
}
</style>