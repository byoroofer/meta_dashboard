export default async function DataDeletionStatusPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawCode = params.confirmation_code;
  const confirmationCode = Array.isArray(rawCode) ? rawCode[0] : rawCode;

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 md:p-8">
      <div className="mx-auto max-w-2xl rounded-[32px] border border-[var(--border)] bg-[var(--panel)] p-8 shadow-[var(--shadow-soft)] md:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Meta data deletion</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950">Deletion request received</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          This page confirms that the Meta app data deletion callback endpoint is reachable and has issued a confirmation code for the request.
        </p>

        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-soft)]">Confirmation code</p>
          <p className="mt-3 break-all font-mono text-sm text-slate-900">{confirmationCode ?? "No confirmation code provided."}</p>
        </div>
      </div>
    </main>
  );
}
