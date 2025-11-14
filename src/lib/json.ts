export type NestedValue = string | { [key: string]: NestedValue };

export const flattenJson = (
  obj: Record<string, NestedValue>,
  prefix = "",
): Record<string, string> => {
  const result: Record<string, string> = {};

  const traverse = (node: NestedValue, currentPrefix: string) => {
    if (typeof node === "string") {
      result[currentPrefix] = node;
      return;
    }

    for (const key in node) {
      const value = node[key];
      const newKey = currentPrefix ? `${currentPrefix}.${key}` : key;
      traverse(value, newKey);
    }
  };

  traverse(obj, prefix);
  return result;
};

export const unflattenJson = (
  flat: Record<string, string>,
): Record<string, NestedValue> => {
  const result: Record<string, NestedValue> = {};

  for (const key in flat) {
    const parts = key.split(".");
    let current: Record<string, NestedValue> = result;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current[part] = flat[key];
      } else {
        if (
          !current[part] ||
          typeof current[part] !== "object" ||
          Array.isArray(current[part])
        ) {
          current[part] = {};
        }
        current = current[part] as Record<string, NestedValue>;
      }
    });
  }

  return result;
};
