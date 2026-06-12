import { assistantPackDefaults, createAssistantPackReport } from "@/lib/assistant-packs";
import { Page, PageHeader } from "@/components/ui";

export default function AssistantPacksAdminPage() {
  const report = createAssistantPackReport(assistantPackDefaults);

  return (
    <Page>
      <PageHeader title="Assistant Packs" />
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Provider Status</div>
        <div className="wiki-portal-body text-[13px]">
          <p>{report.degradation.message}</p>
        </div>
      </div>
      <div className="grid gap-4">
        {report.packs.map((pack) => (
          <div className="wiki-portal" key={pack.id}>
            <div className="wiki-portal-header">{pack.id}</div>
            <div className="wiki-portal-body text-[13px]">
              <dl className="grid gap-2 md:grid-cols-2">
                <div><dt className="font-bold text-heading">Provider</dt><dd>{pack.provider}</dd></div>
                <div><dt className="font-bold text-heading">Model</dt><dd>{pack.model}</dd></div>
                <div><dt className="font-bold text-heading">Privacy</dt><dd>{pack.privacy}</dd></div>
                <div><dt className="font-bold text-heading">Cost</dt><dd>{pack.cost}</dd></div>
                <div><dt className="font-bold text-heading">Retention</dt><dd>{pack.dataRetention}</dd></div>
                <div><dt className="font-bold text-heading">Permissions</dt><dd>{pack.permissions.join(", ") || "None"}</dd></div>
                <div><dt className="font-bold text-heading">Context</dt><dd>{pack.contextSources.join(", ") || "None"}</dd></div>
                <div><dt className="font-bold text-heading">Outputs</dt><dd>{pack.outputTypes.join(", ") || "None"}</dd></div>
              </dl>
            </div>
          </div>
        ))}
      </div>
      <div className="wiki-portal mt-4">
        <div className="wiki-portal-header">Usage Logging</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-1">
            {report.usageLogging.map((rule) => (
              <li key={rule.event}>
                <strong>{rule.event}</strong>: {rule.fields.join(", ")}; cost estimate: {rule.costEstimate}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Page>
  );
}
