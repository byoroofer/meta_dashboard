"use client";

import type { Route } from "next";
import Link from "next/link";
import { Download, Eye, LoaderCircle, RefreshCw, Save, Search, SlidersHorizontal } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { ListingDetailPanel } from "@/components/marketplace/listing-detail-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { withBasePath } from "@/lib/config/base-path";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type {
  MarketplaceDashboardData,
  MarketplaceListingDetail,
  MarketplaceSavedSearch,
  MarketplaceScanResult,
  MarketplaceSearchCriteria
} from "@/types/marketplace";

const emptyCriteria: MarketplaceSearchCriteria = {
  category: "",
  keywords: [],
  mustIncludeWords: [],
  brand: "",
  model: "",
  condition: "any",
  priceFloor: null,
  priceCeiling: null,
  location: "",
  radiusMiles: null,
  excludedWords: [],
  targetResaleValue: null,
  requiredProfitMargin: null,
  sourceKeys: [],
  postedWithinHours: 168
};

function parseList(value: string) {
  return value
    .split(/[,\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function listToText(value: string[]) {
  return value.join(", ");
}

export function MarketplaceDealsWorkspace({ initialData }: { initialData: MarketplaceDashboardData }) {
  const [criteria, setCriteria] = useState<MarketplaceSearchCriteria>(initialData.savedSearches[0]?.criteria ?? emptyCriteria);
  const [presetName, setPresetName] = useState("");
  const [presetDescription, setPresetDescription] = useState("");
  const [savedSearches, setSavedSearches] = useState(initialData.savedSearches);
  const [scanHistory, setScanHistory] = useState(initialData.scanHistory);
  const [results, setResults] = useState(initialData.results);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListingDetail | null>(initialData.selectedListing);
  const [activeScanId, setActiveScanId] = useState<string | null>(initialData.activeScanId);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [minDealScore, setMinDealScore] = useState("0");
  const [minConfidence, setMinConfidence] = useState("0");
  const [postedWithinHours, setPostedWithinHours] = useState("all");
  const [sortBy, setSortBy] = useState("best_deal");
  const [isPending, startTransition] = useTransition();

  const filteredResults = [...results]
    .filter((result) => {
      if (sourceFilter !== "all" && result.source !== sourceFilter) return false;
      if (conditionFilter !== "all" && result.analysis.inferredCondition !== conditionFilter) return false;
      if (result.analysis.dealScore < Number(minDealScore || 0)) return false;
      if (result.analysis.confidence < Number(minConfidence || 0) / 100) return false;
      if (postedWithinHours !== "all" && result.postedAt) {
        const ageHours = (Date.now() - new Date(result.postedAt).getTime()) / (60 * 60 * 1000);
        if (ageHours > Number(postedWithinHours)) return false;
      }

      const haystack = `${result.title} ${result.location} ${result.analysis.reasoning}`.toLowerCase();
      return !searchQuery || haystack.includes(searchQuery.toLowerCase());
    })
    .sort((left, right) => {
      if (sortBy === "newest") return new Date(right.postedAt ?? 0).getTime() - new Date(left.postedAt ?? 0).getTime();
      if (sortBy === "lowest_price") return left.listedPrice - right.listedPrice;
      if (sortBy === "highest_upside") return right.analysis.priceDeltaAmount - left.analysis.priceDeltaAmount;
      if (sortBy === "highest_confidence") return right.analysis.confidence - left.analysis.confidence;
      return right.analysis.dealScore - left.analysis.dealScore;
    });

  async function fetchListingDetail(listingId: string) {
    const response = await fetch(withBasePath(`/api/marketplace-deals/listings/${listingId}`));
    const payload = (await response.json()) as { success?: boolean; data?: MarketplaceListingDetail; error?: string };

    if (!response.ok || !payload.success || !payload.data) {
      throw new Error(payload.error ?? "Unable to load listing detail.");
    }

    setSelectedListing(payload.data);
  }

  async function runScan() {
    startTransition(async () => {
      try {
        const response = await fetch(withBasePath("/api/marketplace-deals/scans"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ criteria })
        });
        const payload = (await response.json()) as {
          success?: boolean;
          data?: { scanId: string; results: MarketplaceScanResult[]; scan: MarketplaceDashboardData["scanHistory"][number] };
          error?: string;
        };

        if (!response.ok || !payload.success || !payload.data) {
          throw new Error(payload.error ?? "Marketplace scan failed.");
        }

        setResults(payload.data.results);
        setActiveScanId(payload.data.scanId);
        setScanHistory((prev) => [payload.data!.scan, ...prev.filter((scan) => scan.id !== payload.data!.scanId)]);

        if (payload.data.results[0]) {
          await fetchListingDetail(payload.data.results[0].listingId);
        } else {
          setSelectedListing(null);
        }

        toast.success(`Scan completed with ${payload.data.results.length} matched listings.`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Marketplace scan failed.");
      }
    });
  }

  async function savePreset() {
    if (!presetName.trim()) {
      toast.error("Preset name is required.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(withBasePath("/api/marketplace-deals/saved-searches"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: presetName,
            description: presetDescription || null,
            criteria
          })
        });
        const payload = (await response.json()) as { success?: boolean; data?: MarketplaceSavedSearch; error?: string };

        if (!response.ok || !payload.success || !payload.data) {
          throw new Error(payload.error ?? "Unable to save preset.");
        }

        setSavedSearches((prev) => [payload.data!, ...prev]);
        setPresetName("");
        setPresetDescription("");
        toast.success("Saved search preset created.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to save preset.");
      }
    });
  }

  async function loadScan(scanId: string) {
    startTransition(async () => {
      try {
        const response = await fetch(withBasePath(`/api/marketplace-deals/results?scanId=${scanId}`));
        const payload = (await response.json()) as { success?: boolean; data?: MarketplaceScanResult[]; error?: string };

        if (!response.ok || !payload.success || !payload.data) {
          throw new Error(payload.error ?? "Unable to load scan results.");
        }

        setResults(payload.data);
        setActiveScanId(scanId);
        if (payload.data[0]) {
          await fetchListingDetail(payload.data[0].listingId);
        } else {
          setSelectedListing(null);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load scan results.");
      }
    });
  }

  function exportCsv() {
    const url = withBasePath(`/api/marketplace-deals/export${activeScanId ? `?scanId=${activeScanId}` : ""}`);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Marketplace intelligence"
        title="Marketplace Deals"
        description="Scan supported listing feeds, normalize messy titles, build comparable sets, estimate fair value with OpenAI-backed reasoning, and rank the strongest deals without pretending the model knows live prices on its own."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={runScan} disabled={isPending}>
              {isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4 text-[var(--accent)]" />}
              Run scan
            </Button>
            <Button variant="outline" onClick={exportCsv} disabled={!results.length}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search target</CardTitle>
              <CardDescription>Define the listing shape to scan, comp, and rank.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Category">
                  <Input value={criteria.category} onChange={(event) => setCriteria((prev) => ({ ...prev, category: event.target.value }))} placeholder="power tools" />
                </Field>
                <Field label="Keywords">
                  <Input value={listToText(criteria.keywords)} onChange={(event) => setCriteria((prev) => ({ ...prev, keywords: parseList(event.target.value) }))} placeholder="milwaukee, drill, fuel" />
                </Field>
                <Field label="Brand">
                  <Input value={criteria.brand} onChange={(event) => setCriteria((prev) => ({ ...prev, brand: event.target.value }))} placeholder="Milwaukee" />
                </Field>
                <Field label="Model">
                  <Input value={criteria.model} onChange={(event) => setCriteria((prev) => ({ ...prev, model: event.target.value }))} placeholder="2804-20" />
                </Field>
                <Field label="Condition">
                  <select
                    value={criteria.condition}
                    onChange={(event) => setCriteria((prev) => ({ ...prev, condition: event.target.value }))}
                    className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3.5 text-sm text-slate-900 outline-none"
                  >
                    {["any", "new", "like_new", "good", "fair", "damaged", "for_parts"].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Price ceiling">
                  <Input value={criteria.priceCeiling ?? ""} onChange={(event) => setCriteria((prev) => ({ ...prev, priceCeiling: event.target.value ? Number(event.target.value) : null }))} placeholder="180" type="number" />
                </Field>
                <Field label="Price floor">
                  <Input value={criteria.priceFloor ?? ""} onChange={(event) => setCriteria((prev) => ({ ...prev, priceFloor: event.target.value ? Number(event.target.value) : null }))} placeholder="50" type="number" />
                </Field>
                <Field label="Radius / location">
                  <Input value={criteria.location} onChange={(event) => setCriteria((prev) => ({ ...prev, location: event.target.value }))} placeholder="Dallas, TX" />
                </Field>
                <Field label="Radius miles">
                  <Input value={criteria.radiusMiles ?? ""} onChange={(event) => setCriteria((prev) => ({ ...prev, radiusMiles: event.target.value ? Number(event.target.value) : null }))} placeholder="25" type="number" />
                </Field>
                <Field label="Must include">
                  <Input value={listToText(criteria.mustIncludeWords)} onChange={(event) => setCriteria((prev) => ({ ...prev, mustIncludeWords: parseList(event.target.value) }))} placeholder="battery, charger" />
                </Field>
                <Field label="Exclude words">
                  <Input value={listToText(criteria.excludedWords)} onChange={(event) => setCriteria((prev) => ({ ...prev, excludedWords: parseList(event.target.value) }))} placeholder="broken, parts, shell" />
                </Field>
                <Field label="Target resale value">
                  <Input value={criteria.targetResaleValue ?? ""} onChange={(event) => setCriteria((prev) => ({ ...prev, targetResaleValue: event.target.value ? Number(event.target.value) : null }))} placeholder="185" type="number" />
                </Field>
                <Field label="Required profit margin">
                  <Input value={criteria.requiredProfitMargin ?? ""} onChange={(event) => setCriteria((prev) => ({ ...prev, requiredProfitMargin: event.target.value ? Number(event.target.value) : null }))} placeholder="45" type="number" />
                </Field>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <Field label="Preset name">
                  <Input value={presetName} onChange={(event) => setPresetName(event.target.value)} placeholder="Milwaukee flips in DFW" />
                </Field>
                <Field label="Preset note">
                  <Input value={presetDescription} onChange={(event) => setPresetDescription(event.target.value)} placeholder="Optional note for operators" />
                </Field>
                <div className="flex items-end">
                  <Button variant="outline" onClick={savePreset} disabled={isPending}>
                    <Save className="mr-2 h-4 w-4" />
                    Save preset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved presets</CardTitle>
              <CardDescription>Reusable scan targets with future cron-ready metadata.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {savedSearches.map((savedSearch) => (
                <button
                  key={savedSearch.id}
                  type="button"
                  onClick={() => setCriteria(savedSearch.criteria)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-slate-50 p-4 text-left transition-colors hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{savedSearch.name}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{savedSearch.description ?? "No preset note."}</p>
                    </div>
                    <Badge variant="default">Alert {savedSearch.alertThresholdScore}</Badge>
                  </div>
                  <p className="mt-3 text-xs text-[var(--muted)]">
                    {savedSearch.lastScannedAt ? `Last scanned ${formatDateTime(savedSearch.lastScannedAt)}` : "Not scanned yet"}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Source status</CardTitle>
              <CardDescription>Adapters stay isolated so approved live sources can be added later without touching the UI or scoring engine.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {initialData.sources.map((source) => (
                <div key={source.key} className="rounded-xl border border-[var(--border)] bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{source.label}</p>
                    <Badge variant={source.mode === "demo" ? "info" : source.enabled ? "success" : "warning"}>{source.mode}</Badge>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{source.legalSummary}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <section className="grid gap-4 md:grid-cols-4">
            <SummaryCard label="Matched listings" value={`${results.length}`} detail="Current active scan results" />
            <SummaryCard label="High-score deals" value={`${results.filter((result) => result.analysis.dealScore >= 80).length}`} detail="Deal score 80+" />
            <SummaryCard label="Avg upside" value={formatCurrency(results.length ? results.reduce((sum, result) => sum + result.analysis.priceDeltaAmount, 0) / results.length : 0)} detail="Average fair-value spread" />
            <SummaryCard label="Watched" value={`${results.filter((result) => result.operatorStatus === "watched").length}`} detail="Operator marked" />
          </section>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Result queue</CardTitle>
                  <CardDescription>Filter and sort the latest scan before drilling into a listing.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted-soft)]" />
                    <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search titles, locations, reasoning" className="h-9 w-[260px] pl-9 text-xs" />
                  </div>
                  <Badge variant="default">
                    <SlidersHorizontal className="mr-1 h-3.5 w-3.5" />
                    Filters
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-6">
                <FilterSelect label="Source" value={sourceFilter} onChange={setSourceFilter} options={["all", ...Array.from(new Set(results.map((result) => result.source)))]} />
                <FilterSelect label="Condition" value={conditionFilter} onChange={setConditionFilter} options={["all", "new", "like_new", "good", "fair", "damaged", "for_parts", "unknown"]} />
                <Field label="Min deal score">
                  <Input value={minDealScore} onChange={(event) => setMinDealScore(event.target.value)} type="number" />
                </Field>
                <Field label="Min confidence">
                  <Input value={minConfidence} onChange={(event) => setMinConfidence(event.target.value)} type="number" />
                </Field>
                <FilterSelect label="Posted within" value={postedWithinHours} onChange={setPostedWithinHours} options={["all", "6", "24", "72", "168"]} />
                <FilterSelect label="Sort by" value={sortBy} onChange={setSortBy} options={["best_deal", "newest", "lowest_price", "highest_upside", "highest_confidence"]} />
              </div>

              <div className="grid gap-3">
                {filteredResults.length ? (
                  filteredResults.map((result) => (
                    <button
                      key={result.scanResultId}
                      type="button"
                      onClick={() => {
                        void fetchListingDetail(result.listingId).catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load listing detail."));
                      }}
                      className={`rounded-2xl border p-4 text-left transition-colors ${
                        selectedListing?.result.listingId === result.listingId
                          ? "border-[var(--accent)] bg-[var(--accent-subtle)]"
                          : "border-[var(--border)] bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="grid gap-4 lg:grid-cols-[84px_minmax(0,1fr)_auto]">
                        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-slate-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={result.imageUrls[0] ?? "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=300&q=80"} alt={result.title} className="h-20 w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-slate-900">{result.title}</p>
                            <Badge variant="default">{result.source.replaceAll("_", " ")}</Badge>
                            <Badge variant={result.analysis.dealScore >= 80 ? "success" : result.analysis.dealScore >= 60 ? "info" : "warning"}>
                              Score {result.analysis.dealScore}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-[var(--muted)]">
                            {formatCurrency(result.listedPrice, result.currency)} listed · {formatCurrency(result.analysis.fairValueMid, result.currency)} fair value · {formatCurrency(result.analysis.priceDeltaAmount, result.currency)} upside
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                            <span>{result.location}</span>
                            <span>{result.postedAt ? formatDateTime(result.postedAt) : "time unknown"}</span>
                            <span>{Math.round(result.analysis.confidence * 100)}% confidence</span>
                            <span>Status: {result.operatorStatus}</span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-700">{result.analysis.reasoning}</p>
                        </div>
                        <div className="flex flex-col items-end justify-between gap-3">
                          <Link
                            href={`/marketplace-deals/${result.listingId}` as Route}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)]"
                          >
                            Open detail <Eye className="h-3.5 w-3.5" />
                          </Link>
                          <div className="text-right">
                            <p className="text-xs text-[var(--muted)]">Resale mid</p>
                            <p className="text-sm font-semibold text-slate-900">{formatCurrency(result.analysis.resaleValueMid, result.currency)}</p>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <EmptyState
                    icon={Search}
                    title="No matching listings"
                    description="Run a scan or loosen the result filters. The current data source set is demo-only until source-specific live adapters are approved."
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scan history</CardTitle>
              <CardDescription>Stored scans are reusable for review, export, and future automation scheduling.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {scanHistory.length ? (
                scanHistory.map((scan) => (
                  <button
                    key={scan.id}
                    type="button"
                    onClick={() => void loadScan(scan.id)}
                    className={`w-full rounded-xl border p-3 text-left ${
                      activeScanId === scan.id ? "border-[var(--accent)] bg-[var(--accent-subtle)]" : "border-[var(--border)] bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{scan.queryLabel}</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">{formatDateTime(scan.startedAt)}</p>
                      </div>
                      <Badge variant={scan.status === "succeeded" ? "success" : scan.status === "failed" ? "danger" : "info"}>{scan.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{scan.summary}</p>
                  </button>
                ))
              ) : (
                <EmptyState title="No scans yet" description="Run the first scan to populate scan history, pricing analysis, and exportable results." />
              )}
            </CardContent>
          </Card>

          {selectedListing ? (
            <ListingDetailPanel
              detail={selectedListing}
              onUpdated={(next) => {
                setSelectedListing(next);
                setResults((prev) =>
                  prev.map((result) =>
                    result.listingId === next.result.listingId
                      ? { ...result, operatorStatus: next.result.operatorStatus, manualNotes: next.result.manualNotes }
                      : result
                  )
                );
              }}
            />
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Legal and technical limits</CardTitle>
              <CardDescription>The page is built for safe extension source-by-source.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {initialData.limitations.map((item) => (
                <div key={item} className="rounded-xl border border-[var(--border)] bg-slate-50 p-3 text-sm leading-6 text-[var(--muted)]">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <Field label={label}>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3.5 text-sm text-slate-900 outline-none">
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-soft)]">
      <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-soft)]">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-[-0.03em] text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{detail}</p>
    </div>
  );
}
