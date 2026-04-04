export interface DashboardScope {
  businessId?: string;
  adAccountId?: string;
}

type SearchParamValue = string | string[] | undefined;

type SearchParamsShape =
  | Promise<Record<string, SearchParamValue>>
  | Record<string, SearchParamValue>
  | URLSearchParams;

function firstValue(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

function cleanValue(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export async function resolveDashboardScope(input?: SearchParamsShape): Promise<DashboardScope> {
  if (!input) {
    return {};
  }

  if (input instanceof URLSearchParams) {
    return {
      businessId: cleanValue(input.get("businessId")),
      adAccountId: cleanValue(input.get("adAccountId"))
    };
  }

  const resolved = await input;

  return {
    businessId: cleanValue(firstValue(resolved.businessId)),
    adAccountId: cleanValue(firstValue(resolved.adAccountId))
  };
}

export function scopeToQueryString(scope?: DashboardScope) {
  const params = new URLSearchParams();

  if (scope?.businessId) {
    params.set("businessId", scope.businessId);
  }

  if (scope?.adAccountId) {
    params.set("adAccountId", scope.adAccountId);
  }

  return params.toString();
}
