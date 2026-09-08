"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button, EmptyState, LinkButton, Page, PageHeader } from "@/components/ui";

type AuditEntry = {
  id: string;
  userId: string | null;
  username: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  entityLabel: string | null;
  workspaceId: string | null;
  severity: string;
  actorType: string;
  success: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

const ACTION_LABELS: Record<string, string> = {
  "article.delete": "Article deleted",
  "article.create": "Article created",
  "article.status_change": "Status changed",
  "article.restore": "Article restored",
  "category.create": "Category created",
  "category.delete": "Category deleted",
  "user.role_change": "Role changed",
  "user.delete": "User deleted",
  "revision.revert": "Revision reverted",
  "discussion.delete": "Comment deleted",
  "space.customization_update": "Customization changed",
  "space.governance_update": "Governance changed",
  "permission.grant": "Permission granted",
  "permission.revoke": "Permission revoked",
  "permission.update": "Permission updated",
  "workspace.invitation_create": "Invitation created",
  "workspace.invitation_resend": "Invitation resent",
  "workspace.invitation_revoke": "Invitation revoked",
  "plugin.install": "Plugin installed",
  "plugin.enable": "Plugin enabled",
  "plugin.disable": "Plugin disabled",
  "plugin.settings_change": "Plugin settings changed",
  "plugin.route_access": "Plugin route accessed",
  "plugin.job_run": "Plugin job run",
  "plugin.hook_failure": "Plugin hook failed",
  "import.preview": "Import previewed",
  "import.execute": "Import executed",
  "export.create": "Export created",
  "export.download": "Export downloaded",
  "marketplace.preview": "Marketplace previewed",
  "marketplace.install": "Marketplace installed",
  "admin.failed_operation": "Admin operation failed",
  "admin.sensitive_action": "Sensitive admin action",
  "security.suspicious_activity": "Suspicious activity",
};

const ACTION_COLOURS: Record<string, string> = {
  "article.delete": "text-red-500",
  "category.delete": "text-red-500",
  "user.delete": "text-red-500",
  "discussion.delete": "text-red-500",
  "revision.revert": "text-amber-500",
  "user.role_change": "text-amber-500",
  "permission.grant": "text-red-500",
  "permission.revoke": "text-red-500",
  "permission.update": "text-amber-500",
  "marketplace.install": "text-red-500",
  "import.execute": "text-red-500",
  "export.download": "text-amber-500",
  "admin.failed_operation": "text-red-500",
  "admin.sensitive_action": "text-red-500",
  "security.suspicious_activity": "text-red-500",
  "plugin.hook_failure": "text-amber-500",
  "article.create": "text-green-600",
  "category.create": "text-green-600",
};

const SEVERITY_COLOURS: Record<string, string> = {
  info: "text-muted",
  warning: "text-amber-600",
  high: "text-orange-600",
  critical: "text-red-600",
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [targetFilter, setTargetFilter] = useState("");
  const [workspaceFilter, setWorkspaceFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [successFilter, setSuccessFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const buildParams = useCallback((nextPage = page) => {
    const params = new URLSearchParams({ page: String(page) });
    if (actionFilter) params.set("action", actionFilter);
    if (actorFilter) params.set("actor", actorFilter);
    if (targetFilter) params.set("target", targetFilter);
    if (workspaceFilter) params.set("workspaceId", workspaceFilter);
    if (severityFilter) params.set("severity", severityFilter);
    if (successFilter) params.set("success", successFilter);
    if (dateFromFilter) params.set("dateFrom", dateFromFilter);
    if (dateToFilter) params.set("dateTo", dateToFilter);
    params.set("page", String(nextPage));
    return params;
  }, [actionFilter, actorFilter, dateFromFilter, dateToFilter, page, severityFilter, successFilter, targetFilter, workspaceFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    const params = buildParams();
    const res = await fetch(`/api/admin/audit-log?${params}`);
    if (res.ok) {
      const data = await res.json();
      setLogs(data.logs);
      setTotal(data.total);
      setPages(data.pages);
    }
    setLoading(false);
  }, [buildParams]);

  useEffect(() => { load(); }, [load]);

  const exportHref = `/api/admin/audit-log?${new URLSearchParams({
    ...Object.fromEntries(buildParams(1)),
    download: "1",
    redaction: "standard",
  })}`;

  const resetPage = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <Page>
      <PageHeader
        title="Audit Log"
        description={`${total} entries total`}
        actions={<LinkButton href="/admin">← Admin</LinkButton>}
      />

      {/* Filters */}
      <div className="grid grid-cols-1 gap-2 mb-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <select
          value={actionFilter}
          onChange={(e) => resetPage(setActionFilter)(e.target.value)}
          className="border border-border bg-surface px-2 py-1 text-[13px] text-foreground focus:border-accent focus:outline-none"
        >
          <option value="">All actions</option>
          {Object.entries(ACTION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <input
          value={actorFilter}
          onChange={(e) => resetPage(setActorFilter)(e.target.value)}
          placeholder="Actor"
          className="border border-border bg-surface px-2 py-1 text-[13px] text-foreground focus:border-accent focus:outline-none"
        />
        <input
          value={targetFilter}
          onChange={(e) => resetPage(setTargetFilter)(e.target.value)}
          placeholder="Target"
          className="border border-border bg-surface px-2 py-1 text-[13px] text-foreground focus:border-accent focus:outline-none"
        />
        <input
          value={workspaceFilter}
          onChange={(e) => resetPage(setWorkspaceFilter)(e.target.value)}
          placeholder="Workspace"
          className="border border-border bg-surface px-2 py-1 text-[13px] text-foreground focus:border-accent focus:outline-none"
        />
        <select
          value={severityFilter}
          onChange={(e) => resetPage(setSeverityFilter)(e.target.value)}
          className="border border-border bg-surface px-2 py-1 text-[13px] text-foreground focus:border-accent focus:outline-none"
        >
          <option value="">All severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select
          value={successFilter}
          onChange={(e) => resetPage(setSuccessFilter)(e.target.value)}
          className="border border-border bg-surface px-2 py-1 text-[13px] text-foreground focus:border-accent focus:outline-none"
        >
          <option value="">All outcomes</option>
          <option value="true">Succeeded</option>
          <option value="false">Failed</option>
        </select>
        <input
          type="date"
          value={dateFromFilter}
          onChange={(e) => resetPage(setDateFromFilter)(e.target.value)}
          className="border border-border bg-surface px-2 py-1 text-[13px] text-foreground focus:border-accent focus:outline-none"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={dateToFilter}
            onChange={(e) => resetPage(setDateToFilter)(e.target.value)}
            className="min-w-0 flex-1 border border-border bg-surface px-2 py-1 text-[13px] text-foreground focus:border-accent focus:outline-none"
          />
          <Link href={exportHref} className="ui-button whitespace-nowrap">
            Export
          </Link>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-[13px] text-muted italic">Loading...</p>
      ) : logs.length === 0 ? (
        <EmptyState title="No entries found." />
      ) : (
        <div className="border border-border overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-surface-hover border-b border-border">
                <th className="text-left px-3 py-2 text-[11px] font-bold text-muted uppercase">Time</th>
                <th className="text-left px-3 py-2 text-[11px] font-bold text-muted uppercase">User</th>
                <th className="text-left px-3 py-2 text-[11px] font-bold text-muted uppercase">Action</th>
                <th className="text-left px-3 py-2 text-[11px] font-bold text-muted uppercase">Severity</th>
                <th className="text-left px-3 py-2 text-[11px] font-bold text-muted uppercase">Workspace</th>
                <th className="text-left px-3 py-2 text-[11px] font-bold text-muted uppercase">Target</th>
                <th className="text-left px-3 py-2 text-[11px] font-bold text-muted uppercase">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((entry, i) => (
                <tr key={entry.id} className={i % 2 === 0 ? "bg-surface" : "bg-surface-hover"}>
                  <td className="px-3 py-2 text-muted whitespace-nowrap">
                    {new Date(entry.createdAt).toLocaleString("en-US", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="px-3 py-2 font-medium text-heading">
                    {entry.username ?? <span className="text-muted italic">system</span>}
                  </td>
                  <td className={`px-3 py-2 font-medium ${ACTION_COLOURS[entry.action] ?? "text-foreground"}`}>
                    {ACTION_LABELS[entry.action] ?? entry.action}
                  </td>
                  <td className={`px-3 py-2 font-medium ${SEVERITY_COLOURS[entry.severity] ?? "text-muted"}`}>
                    {entry.success ? entry.severity : `${entry.severity} / failed`}
                  </td>
                  <td className="px-3 py-2 text-muted">
                    {entry.workspaceId ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-foreground">
                    <span className="text-muted text-[11px] mr-1">{entry.entityType}</span>
                    {entry.entityLabel ?? entry.entityId ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-muted text-[11px] max-w-[200px] truncate">
                    {entry.metadata ? JSON.stringify(entry.metadata) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center gap-2 mt-4">
          <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            ← Prev
          </Button>
          <span className="text-[12px] text-muted">Page {page} of {pages}</span>
          <Button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next →
          </Button>
        </div>
      )}
    </Page>
  );
}
