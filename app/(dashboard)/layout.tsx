import { AppHeader } from "@/components/app-shell/app-header";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { requireAdminSession } from "@/lib/auth/session";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdminSession();

  return (
    <div className="min-h-screen p-4 md:p-5">
      <div className="grid min-h-[calc(100vh-2rem)] gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar user={session.user} />
        <div className="space-y-4">
          <AppHeader user={session.user} requiresMfaEnrollment={session.requiresMfaEnrollment} />
          <main className="app-shell-panel rounded-[28px] border border-white/10 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
