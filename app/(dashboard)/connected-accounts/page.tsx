import { resolveDashboardScope } from "@/lib/dashboard/scope";
import { AccountsWorkspace } from "@/components/connected-accounts/accounts-workspace";
import { getConnectedAccountsData } from "@/lib/services/connected-accounts-service";

export default async function ConnectedAccountsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const scope = await resolveDashboardScope(searchParams);
  const data = await getConnectedAccountsData(scope);
  return <AccountsWorkspace {...data} />;
}
