"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, DataTable, EmptyState, Input, LinkButton, Page, PageHeader, Select } from "@/components/ui";

type AuditEntry = {
  id: string;
  userId: string | null;
  username: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  entityLabel: string | null;
  severity: string;
  actorType: string;
  success: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

const ACTION_LABELS: Record<string, string> = {
  "admin.failed_operation": "admin operation failed",
  "article.create": "article created",
  "article.delete": "article deleted",
  "article.restore": "article restored",
  "article.status_change": "status changed",
  "category.create": "category created",
  "category.delete": "category deleted",
  "export.create": "export created",
  "revision.revert": "revision reverted",
  "user.delete": "user deleted",
  "user.role_change": "role changed",
};

const ACTION_COLOURS: Record<string, string> = {
  "article.delete": "text-danger",
  "category.delete": "text-danger",
  "user.delete": "text-danger",
  "revision.revert": "text-warning",
  "user.role_change": "text-warning",
  "export.create": "text-warning",
  "admin.failed_operation": "text-danger",
  "article.create": "text-success",
  "category.create": "text-success",
};

const SEVERITY_COLOURS: Record<string, string> = {
  info: "text-muted",
  warning: "text-warning",
  high: "text-warning",
  critical: "text-danger",
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [targetFilter, setTargetFilter] = useState("");
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
    if (severityFilter) params.set("severity", severityFilter);
    if (successFilter) params.set("success", successFilter);
    if (dateFromFilter) params.set("dateFrom", dateFromFilter);
    if (dateToFilter) params.set("dateTo", dateToFilter);
    params.set("page", String(nextPage));
    return params;
  }, [actionFilter, actorFilter, dateFromFilter, dateToFilter, page, severityFilter, successFilter, targetFilter]);

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
        title="audit log"
        description={`${total} entries total`}
        actions={<LinkButton href="/admin">← Admin</LinkButton>}
      />

      {/* Filters */}
      <div className="grid grid-cols-1 gap-2 mb-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <Select
          value={actionFilter}
          onChange={(e) => resetPage(setActionFilter)(e.target.value)}
        >
          <option value="">All actions</option>
          {Object.entries(ACTION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
        <Input
          value={actorFilter}
          onChange={(e) => resetPage(setActorFilter)(e.target.value)}
          placeholder="Actor"
        />
        <Input
          value={targetFilter}
          onChange={(e) => resetPage(setTargetFilter)(e.target.value)}
          placeholder="Target"
        />
        <Select
          value={severityFilter}
          onChange={(e) => resetPage(setSeverityFilter)(e.target.value)}
        >
          <option value="">All severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </Select>
        <Select
          value={successFilter}
          onChange={(e) => resetPage(setSuccessFilter)(e.target.value)}
        >
          <option value="">All outcomes</option>
          <option value="true">Succeeded</option>
          <option value="false">Failed</option>
        </Select>
        <Input
          type="date"
          value={dateFromFilter}
          onChange={(e) => resetPage(setDateFromFilter)(e.target.value)}
        />
        <div className="flex gap-2">
          <Input
            type="date"
            value={dateToFilter}
            onChange={(e) => resetPage(setDateToFilter)(e.target.value)}
            className="min-w-0 flex-1"
          />
          <LinkButton href={exportHref} prefetch={false} className="whitespace-nowrap">
            Export
          </LinkButton>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-[13px] text-muted italic">Loading...</p>
      ) : logs.length === 0 ? (
        <EmptyState title="No entries found." />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Action</th>
              <th>Severity</th>
              <th>Target</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((entry) => (
              <tr key={entry.id}>
                <td className="text-muted whitespace-nowrap">
                  {new Date(entry.createdAt).toLocaleString("en-US", {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </td>
                <td className="font-medium text-heading">
                  {entry.username ?? <span className="text-muted italic">system</span>}
                </td>
                <td className={`font-medium ${ACTION_COLOURS[entry.action] ?? "text-foreground"}`}>
                  {ACTION_LABELS[entry.action] ?? entry.action}
                </td>
                <td className={`font-medium ${SEVERITY_COLOURS[entry.severity] ?? "text-muted"}`}>
                  {entry.success ? entry.severity : `${entry.severity} / failed`}
                </td>
                <td className="text-foreground">
                  <span className="text-muted text-[11px] mr-1">{entry.entityType}</span>
                  {entry.entityLabel ?? entry.entityId ?? "—"}
                </td>
                <td className="text-muted text-[11px] max-w-[200px] truncate">
                  {entry.metadata ? JSON.stringify(entry.metadata) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
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
