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
import { ref, onMounted, onUnmounted, computed } from "vue";

export type AnimationLevel = "high" | "medium" | "low";

const props = defineProps<{
  rowCount?: number;
}>();

const currentFps = ref(0);
const animationLevel = ref<AnimationLevel>("high");
const frameDeltas = ref<number[]>([]);

const SAMPLE_SIZE = 30;
const DOWNGRADE_THRESHOLD = 50; // fps < 50 for 30 frames -> medium
const UPGRADE_THRESHOLD = 58;   // fps > 58 for 30 frames -> high
const LOW_THRESHOLD = 30;       // fps < 30 -> low immediately

let rafId = 0;
let lastTime = 0;
let belowThresholdCount = 0;
let aboveThresholdCount = 0;

function tick(now: number) {
  if (lastTime > 0) {
    const delta = now - lastTime;
    const fps = 1000 / delta;
    currentFps.value = Math.min(Math.round(fps), 240);

    frameDeltas.value.push(delta);
    if (frameDeltas.value.length > SAMPLE_SIZE) {
      frameDeltas.value.shift();
    }

    // Adaptive logic
    if (fps < LOW_THRESHOLD) {
      if (animationLevel.value !== "low") {
        animationLevel.value = "low";
      }
      belowThresholdCount = 0;
      aboveThresholdCount = 0;
    } else if (fps < DOWNGRADE_THRESHOLD) {
      belowThresholdCount++;
      aboveThresholdCount = 0;
      if (belowThresholdCount >= SAMPLE_SIZE && animationLevel.value === "high") {
        animationLevel.value = "medium";
        belowThresholdCount = 0;
      }
    } else if (fps > UPGRADE_THRESHOLD) {
      aboveThresholdCount++;
      belowThresholdCount = 0;
      if (aboveThresholdCount >= SAMPLE_SIZE && animationLevel.value !== "high") {
        animationLevel.value = "high";
        aboveThresholdCount = 0;
      }
    } else {
      // In the gray zone, slowly decay counters
      belowThresholdCount = Math.max(0, belowThresholdCount - 1);
      aboveThresholdCount = Math.max(0, aboveThresholdCount - 1);
    }
  }
  lastTime = now;
  rafId = requestAnimationFrame(tick);
}

onMounted(() => {
  rafId = requestAnimationFrame(tick);
});

onUnmounted(() => {
  cancelAnimationFrame(rafId);
});

// Expose for parent access
const levelClass = computed(() => `anim-${animationLevel.value}`);

defineExpose({
  animationLevel,
  currentFps,
  levelClass,
});
</script>

<template>
  <!-- No visible UI — pure background monitoring -->
  <div class="perf-monitor" :class="levelClass" aria-hidden="true"></div>
</template>

<style scoped lang="scss">
.perf-monitor {
  display: none;
}
</style>
