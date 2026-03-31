import { AppHeader } from "@/components/app-shell/app-header";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { requireAdminSession } from "@/lib/auth/session";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdminSession();

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 md:p-5">
      <div className="grid min-h-[calc(100vh-2rem)] gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
        <AppSidebar user={session.user} />
        <div className="space-y-4">
          <AppHeader user={session.user} requiresMfaEnrollment={session.requiresMfaEnrollment} />
          <main className="app-page-surface rounded-3xl border border-[var(--border)] p-5 shadow-[var(--shadow-soft)] md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
