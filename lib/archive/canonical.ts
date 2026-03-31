import { createHash } from "crypto";

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }

  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((accumulator, key) => {
        accumulator[key] = sortValue((value as Record<string, unknown>)[key]);
        return accumulator;
      }, {});
  }

  return value;
}

export function buildCanonicalArchiveSnapshot(payload: unknown) {
  const canonicalPayload = sortValue(payload);
  const serialized = JSON.stringify(canonicalPayload);
  const hash = createHash("sha256").update(serialized).digest("hex");

  return {
    canonicalPayload,
    snapshotHash: hash
  };
}
