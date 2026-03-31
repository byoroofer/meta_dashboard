import { AccountsWorkspace } from "@/components/connected-accounts/accounts-workspace";
import { getConnectedAccountsData } from "@/lib/services/connected-accounts-service";

export default async function ConnectedAccountsPage() {
  const data = await getConnectedAccountsData();
  return <AccountsWorkspace {...data} />;
}
