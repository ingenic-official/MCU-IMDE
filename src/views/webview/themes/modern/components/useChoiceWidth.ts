import { computed, ref, watch, nextTick, onMounted, type Ref, type ComputedRef } from "vue";
import type { Menu } from "../../../../../menuconfig/Menu";

export function useChoiceWidth(isChoiceRow: ComputedRef<boolean>, item: ComputedRef<Menu>) {
  const choiceSelectRef = ref<HTMLSelectElement | null>(null);
  const choiceSelectWidth = ref("140px");
  let choiceMeasureCanvas: HTMLCanvasElement | null = null;

  const choiceOptionLabels = computed(() =>
    (item.value.children || [])
      .map((c: Menu) => c.title || c.name || "")
      .filter(Boolean)
  );

  const measureChoiceTextWidth = (text: string, font: string): number => {
    if (!choiceMeasureCanvas) choiceMeasureCanvas = document.createElement("canvas");
    const ctx = choiceMeasureCanvas.getContext("2d");
    if (!ctx) return text.length * 8;
    ctx.font = font;
    return ctx.measureText(text).width;
  };

  const updateChoiceSelectWidth = () => {
    const labels = choiceOptionLabels.value;
    const minWidth = 140;
    if (!isChoiceRow.value || labels.length === 0) {
      choiceSelectWidth.value = `${minWidth}px`;
      return;
    }
    const target = choiceSelectRef.value;
    let font = "13px sans-serif";
    let paddingLeft = 10, paddingRight = 28, borderLeft = 1, borderRight = 1;
    if (target && typeof window !== "undefined") {
      const style = window.getComputedStyle(target);
      font = style.font || `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      paddingLeft = parseFloat(style.paddingLeft) || paddingLeft;
      paddingRight = parseFloat(style.paddingRight) || paddingRight;
      borderLeft = parseFloat(style.borderLeftWidth) || borderLeft;
      borderRight = parseFloat(style.borderRightWidth) || borderRight;
    }
    const maxLabelWidth = labels.reduce((max: number, text: string) =>
      Math.max(max, measureChoiceTextWidth(text, font)), 0);
    const totalWidth = Math.ceil(maxLabelWidth + paddingLeft + paddingRight + borderLeft + borderRight + 14 + 10);
    choiceSelectWidth.value = `${Math.max(minWidth, totalWidth)}px`;
  };

  watch(choiceOptionLabels, () => nextTick(updateChoiceSelectWidth), { immediate: true });
  watch(() => item.value.id, () => nextTick(updateChoiceSelectWidth));
  onMounted(() => nextTick(updateChoiceSelectWidth));

  return { choiceSelectRef, choiceSelectWidth };
}
