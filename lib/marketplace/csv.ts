import type { MarketplaceScanResult } from "@/types/marketplace";

function escapeCsv(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  if (text.includes(",") || text.includes("\"") || text.includes("\n")) {
    return `"${text.replaceAll("\"", "\"\"")}"`;
  }
  return text;
}

export function buildMarketplaceResultsCsv(results: MarketplaceScanResult[]) {
  const headers = [
    "title",
    "source",
    "listed_price",
    "fair_value",
    "upside_dollars",
    "upside_percent",
    "resale_mid",
    "deal_score",
    "confidence",
    "condition",
    "location",
    "operator_status",
    "risk_flags",
    "reasoning",
    "url"
  ];

  const rows = results.map((result) => [
    result.title,
    result.source,
    result.listedPrice,
    result.analysis.fairValueMid,
    result.analysis.priceDeltaAmount,
    result.analysis.priceDeltaPercent,
    result.analysis.resaleValueMid,
    result.analysis.dealScore,
    result.analysis.confidence,
    result.analysis.inferredCondition,
    result.location,
    result.operatorStatus,
    result.analysis.riskFlags.map((flag) => flag.label).join(" | "),
    result.analysis.reasoning,
    result.url
  ]);

  return [headers, ...rows].map((row) => row.map((value) => escapeCsv(value)).join(",")).join("\n");
}
