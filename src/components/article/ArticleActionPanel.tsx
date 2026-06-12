import type { ReactNode } from "react";

type ActionGroup = {
  label: string;
  children: ReactNode;
  /** Render collapsed behind a disclosure menu instead of inline. */
  menu?: boolean;
};

type Props = {
  groups: ActionGroup[];
};

export default function ArticleActionPanel({ groups }: Props) {
  const primaryGroups = groups.filter((group) => !group.menu);
  const drawerGroups = groups.filter((group) => group.menu);

  return (
    <section className="article-action-panel" aria-label="Article actions">
      <div className="article-action-primary">
        {primaryGroups.map((group) => (
          <div key={group.label} className="article-action-group">
            <div className="article-action-group-header">
              <span className="article-action-label">{group.label}</span>
            </div>
            <div className="article-action-controls">{group.children}</div>
          </div>
        ))}

        {drawerGroups.map((group) => (
          <details key={group.label} className="article-action-menu">
            <summary className="article-action-menu-summary">
              <span>{group.label}</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <div className="article-action-menu-content">
              <div className="article-action-controls">{group.children}</div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
