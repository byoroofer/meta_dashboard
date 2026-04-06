const sections = [
  {
    title: "Information we process",
    body:
      "Meta Dashboard processes business contact information, Page and Instagram messages, lead form submissions, campaign and ad reporting data, technical request logs, and operator audit records needed to run the dashboard."
  },
  {
    title: "How we use data",
    body:
      "We use this information to review and respond to customer inquiries, synchronize supported Meta business assets, monitor campaign performance, route leads, maintain operational records, and secure the service against misuse."
  },
  {
    title: "Data sources",
    body:
      "Data may be received directly from Meta platforms such as Facebook Pages, Instagram professional accounts, and Meta lead forms, as well as from internal operator activity inside the dashboard."
  },
  {
    title: "Sharing and disclosure",
    body:
      "We do not sell personal information. Data may be shared with service providers or internal business operators only as needed to host, secure, maintain, support, or lawfully operate the dashboard and connected business workflows."
  },
  {
    title: "Retention",
    body:
      "Operational records, message archives, webhook logs, and related compliance records may be retained for support, legal, security, and business recordkeeping purposes for as long as reasonably necessary."
  },
  {
    title: "Your choices",
    body:
      "If you believe your personal information has been processed through this app and you want to request deletion or ask a privacy question, use the deletion callback flow configured in Meta or contact the business operator responsible for the connected asset."
  }
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] p-6 md:p-8">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-[var(--border)] bg-[var(--panel)] p-8 shadow-[var(--shadow-soft)] md:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Privacy Policy</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-950">Meta Dashboard privacy policy</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)]">
          This privacy policy explains how Meta Dashboard handles information received through connected Meta business assets and related dashboard operations.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-[var(--border)] bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-950">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{section.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-2xl border border-[var(--border)] bg-slate-50 p-5">
          <h2 className="text-lg font-semibold text-slate-950">Data deletion callback</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            Meta data deletion requests for this app are handled through the configured callback endpoint at
            {" "}
            <span className="font-mono text-slate-900">https://tjware.me/api/meta/data-deletion</span>.
          </p>
        </section>

        <section className="mt-4 rounded-2xl border border-[var(--border)] bg-slate-50 p-5">
          <h2 className="text-lg font-semibold text-slate-950">Contact</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            For privacy questions or operational data concerns related to this dashboard, contact the business operator responsible for the connected Meta asset that collected the data.
          </p>
        </section>

        <p className="mt-8 text-xs uppercase tracking-[0.18em] text-[var(--muted-soft)]">Last updated: April 5, 2026</p>
      </div>
    </main>
  );
}
