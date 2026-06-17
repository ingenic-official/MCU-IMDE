import { computed, ref, watch, type Ref, type ComputedRef } from "vue";
import type { Menu } from "../../../../../menuconfig/Menu";

type TriValue = "n" | "m" | "y";

export function useTristate(item: ComputedRef<Menu>, isReadonly: ComputedRef<boolean>) {
  function normalizeTriValue(value: any): TriValue {
    if (typeof value === "string") {
      const lower = value.toLowerCase();
      if (lower === "y" || lower === "true" || lower === "2") return "y";
      if (lower === "m" || lower === "1") return "m";
      return "n";
    }
    if (typeof value === "number") {
      if (value >= 2) return "y";
      if (value === 1) return "m";
      return "n";
    }
    if (typeof value === "boolean") return value ? "y" : "n";
    return "n";
  }

  const allowedTriOptions = computed<TriValue[]>(() => {
    const allowed = item.value.allowedTristateValues;
    if (allowed && allowed.length > 0) {
      const normalized: TriValue[] = [];
      for (const option of allowed) {
        const nv = normalizeTriValue(option);
        if (!normalized.includes(nv)) normalized.push(nv);
      }
      return normalized.length > 0 ? normalized : ["n", "m", "y"];
    }
    return ["n", "m", "y"];
  });

  const triSelectOptions = computed<Array<{ value: TriValue; disabled: boolean }>>(() =>
    (["n", "m", "y"] as TriValue[]).map((option) => ({
      value: option,
      disabled: !allowedTriOptions.value.includes(option),
    }))
  );

  const isTriSelectDisabled = computed(
    () => isReadonly.value || allowedTriOptions.value.length <= 1
  );

  function ensureTriValueAllowed(value: TriValue): TriValue {
    const options = allowedTriOptions.value;
    return options.includes(value) ? value : (options[0] ?? "n");
  }

  const triValue = ref<TriValue>(ensureTriValueAllowed(normalizeTriValue(item.value.value)));
  watch(() => item.value.value, (value) => {
    triValue.value = ensureTriValueAllowed(normalizeTriValue(value));
  });
  watch(allowedTriOptions, () => {
    triValue.value = ensureTriValueAllowed(triValue.value);
  });

  return {
    normalizeTriValue, allowedTriOptions, triSelectOptions, isTriSelectDisabled,
    ensureTriValueAllowed, triValue,
  };
}
