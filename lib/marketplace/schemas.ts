import { z } from "zod";

const nonNegativeNullableNumber = z.number().finite().min(0).nullable();

export const marketplaceSearchCriteriaSchema = z.object({
  category: z.string().trim().default(""),
  keywords: z.array(z.string().trim().min(1)).default([]),
  mustIncludeWords: z.array(z.string().trim().min(1)).default([]),
  brand: z.string().trim().default(""),
  model: z.string().trim().default(""),
  condition: z.string().trim().default(""),
  priceFloor: nonNegativeNullableNumber.default(null),
  priceCeiling: nonNegativeNullableNumber.default(null),
  location: z.string().trim().default(""),
  radiusMiles: nonNegativeNullableNumber.default(null),
  excludedWords: z.array(z.string().trim().min(1)).default([]),
  targetResaleValue: nonNegativeNullableNumber.default(null),
  requiredProfitMargin: nonNegativeNullableNumber.default(null),
  sourceKeys: z.array(z.string().trim().min(1)).default([]),
  postedWithinHours: nonNegativeNullableNumber.default(null)
});

export const marketplaceSavedSearchCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).nullable().optional(),
  criteria: marketplaceSearchCriteriaSchema,
  scheduleEnabled: z.boolean().default(false),
  scheduleLabel: z.string().trim().max(120).nullable().optional(),
  alertThresholdScore: z.number().int().min(1).max(100).default(82)
});

export const marketplaceScanRequestSchema = z.object({
  savedSearchId: z.string().uuid().optional(),
  criteria: marketplaceSearchCriteriaSchema.optional()
});

export const marketplaceListingStatusUpdateSchema = z.object({
  operatorStatus: z.enum(["new", "watched", "ignored", "contacted", "purchased"]),
  manualNotes: z.string().max(4000).default("")
});

export const marketplaceAIResponseSchema = z.object({
  normalizedTitle: z.string().min(1),
  inferredBrand: z.string().nullable(),
  inferredModel: z.string().nullable(),
  inferredCategory: z.string().nullable(),
  inferredCondition: z.enum(["new", "like_new", "good", "fair", "damaged", "for_parts", "unknown"]),
  confidence: z.number().min(0).max(1),
  fairValueLow: z.number().min(0),
  fairValueMid: z.number().min(0),
  fairValueHigh: z.number().min(0),
  resaleValueLow: z.number().min(0),
  resaleValueMid: z.number().min(0),
  resaleValueHigh: z.number().min(0),
  bestUseCase: z.string().min(1),
  resalePotential: z.string().min(1),
  riskFlags: z.array(
    z.object({
      code: z.string().min(1),
      label: z.string().min(1),
      severity: z.enum(["low", "medium", "high"])
    })
  ),
  reasoning: z.string().min(1),
  suggestedCompKeywords: z.array(z.string().min(1)),
  parsedAttributes: z.record(z.string(), z.unknown())
});

export type MarketplaceAIResponseShape = z.infer<typeof marketplaceAIResponseSchema>;
