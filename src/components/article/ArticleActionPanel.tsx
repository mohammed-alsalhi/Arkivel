import type { ReactNode } from "react";

type ActionGroup = {
  label: string;
  children: ReactNode;
};

type Props = {
  groups: ActionGroup[];
};

export default function ArticleActionPanel({ groups }: Props) {
  return (
    <section className="article-action-panel" aria-label="Article actions">
      {groups.map((group) => (
        <div key={group.label} className="article-action-group">
          <div className="article-action-group-header">
            <span className="article-action-label">{group.label}</span>
          </div>
          <div className="article-action-controls">{group.children}</div>
        </div>
      ))}
    </section>
  );
}
