import { AppHeader } from "@/components/app-shell/app-header";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { requireAdminSession } from "@/lib/auth/session";
import { dashboardRepository } from "@/lib/repositories/dashboard-repository";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdminSession();
  const scopeOptions = await dashboardRepository.getScopeOptions();

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 md:p-5">
      <div className="grid min-h-[calc(100vh-2rem)] gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
        <AppSidebar user={session.user} />
        <div className="space-y-4">
          <AppHeader user={session.user} requiresMfaEnrollment={session.requiresMfaEnrollment} scopeOptions={scopeOptions} />
          <main className="app-page-surface rounded-3xl border border-[var(--border)] p-5 shadow-[var(--shadow-soft)] md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
