"use client";

import type { ReactNode, CSSProperties } from "react";
import type { Editor } from "@tiptap/react";
import OutlineBuilderPanel from "./OutlineBuilderPanel";
import GrammarCheckPanel from "./GrammarCheckPanel";
import WritingCoachPanel from "./WritingCoachPanel";
import styles from "./TiptapEditor.module.css";

export type EditorCheck = {
  label: string;
  detail: string;
  status: "good" | "warn" | "info";
};

export type EditorOutlineItem = {
  level: number;
  text: string;
  pos: number;
};

export type EditorTelemetry = {
  words: number;
  characters: number;
  readMinutes: number;
  headings: number;
  links: number;
  wikiLinks: number;
  footnotes: number;
  images: number;
  tables: number;
  richBlocks: number;
  codeBlocks: number;
  selectedWords: number;
  selectedCharacters: number;
  outline: EditorOutlineItem[];
  checks: EditorCheck[];
  score: number;
};

export type EditorCommandItem = {
  id: string;
  label: string;
  meta: string;
  group: string;
};

export type SelectionAction = {
  id: string;
  label: string;
  onSelect: () => void;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function EditorTrayShell({
  label,
  description,
  children,
  testId,
}: {
  label: string;
  description: string;
  children: ReactNode;
  testId: string;
}) {
  return (
    <section className={styles.tray} data-testid={testId} aria-label={`${label} tools`}>
      <div className={styles.trayHeader}>
        <div>
          <h3 className={styles.trayTitle}>{label}</h3>
          <p className={styles.trayDescription}>{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function EditorInsertTray({
  commands,
  groups,
  onInsert,
}: {
  commands: EditorCommandItem[];
  groups: { label: string; ids: string[] }[];
  onInsert: (id: string) => void;
}) {
  return (
    <EditorTrayShell
      label="Insert"
      description="Add a block, then get straight back to writing."
      testId="editor-insert-tray"
    >
      <div className={styles.commandSections}>
        {groups.map((group) => (
          <section key={group.label} className={styles.commandSection}>
            <h4 className={styles.commandSectionTitle}>{group.label}</h4>
            <div className={styles.commandList}>
              {group.ids.map((id) => {
                const command = commands.find((item) => item.id === id);
                if (!command) return null;
                return (
                  <button
                    key={command.id}
                    type="button"
                    onClick={() => onInsert(command.id)}
                    className={styles.commandButton}
                  >
                    <span>{command.label}</span>
                    <small>{command.meta}</small>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </EditorTrayShell>
  );
}

export function EditorReviewTray({
  editor,
  telemetry,
}: {
  editor: Editor;
  telemetry: EditorTelemetry;
}) {
  return (
    <EditorTrayShell
      label="Review"
      description="A quick pass for structure, links, sources, and style."
      testId="editor-review-tray"
    >
      <div className={styles.reviewStrip}>
        <div className={styles.scorePanel}>
          <div className={styles.scoreRing} style={{ "--editor-score": `${telemetry.score}%` } as CSSProperties}>
            <span>{telemetry.score}</span>
          </div>
          <div className={styles.scoreCopy}>
            <strong>Readiness</strong>
            <span>{telemetry.words} words - {telemetry.readMinutes} min read</span>
          </div>
        </div>

        <div className={styles.signalRow}>
          <span><strong>{telemetry.wikiLinks}</strong> wiki</span>
          <span><strong>{telemetry.links}</strong> links</span>
          <span><strong>{telemetry.footnotes}</strong> notes</span>
          <span><strong>{telemetry.tables}</strong> tables</span>
          <span><strong>{telemetry.images}</strong> images</span>
          <span><strong>{telemetry.richBlocks}</strong> rich</span>
        </div>
      </div>

      <details className={styles.disclosure} open>
        <summary>Quality checks</summary>
        <div className={styles.disclosureBody}>
          <div className={styles.checkList}>
            {telemetry.checks.map((check) => (
              <div key={check.label} className={styles.checkItem} data-status={check.status}>
                <span />
                <div>
                  <strong>{check.label}</strong>
                  <p>{check.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </details>

      <details className={styles.disclosure}>
        <summary>Grammar and style</summary>
        <div className={styles.disclosureBody}>
          <GrammarCheckPanel editor={editor} />
        </div>
      </details>

      <details className={styles.disclosure}>
        <summary>Writing coach</summary>
        <div className={styles.disclosureBody}>
          <WritingCoachPanel getHtml={() => editor.getHTML()} hasExcerpt={false} />
        </div>
      </details>
    </EditorTrayShell>
  );
}

export function EditorOutlineTray({
  editor,
  articleTitle,
  outline,
  onJump,
}: {
  editor: Editor;
  articleTitle: string;
  outline: EditorOutlineItem[];
  onJump: (item: EditorOutlineItem) => void;
}) {
  return (
    <EditorTrayShell
      label="Outline"
      description="Move through sections or generate a cleaner shape."
      testId="editor-outline-tray"
    >
      <div className={styles.traySplit}>
        <div className={styles.trayPanel}>
          <h4>Current sections</h4>
          {outline.length > 0 ? (
            <div className={styles.outlineList}>
              {outline.slice(0, 16).map((item, index) => (
                <button
                  key={`${item.pos}-${index}`}
                  type="button"
                  onClick={() => onJump(item)}
                  data-level={item.level}
                >
                  {item.text}
                </button>
              ))}
            </div>
          ) : (
            <p className={styles.emptyNote}>No headings yet.</p>
          )}
        </div>
        <details className={cx(styles.trayPanel, styles.disclosure)}>
          <summary>Outline builder</summary>
          <div className={styles.disclosureBody}>
            <OutlineBuilderPanel editor={editor} articleTitle={articleTitle} />
          </div>
        </details>
      </div>
    </EditorTrayShell>
  );
}

export function EditorSelectionActions({
  selectedWords,
  actions,
}: {
  selectedWords: number;
  actions: SelectionAction[];
}) {
  return (
    <div className={styles.selectionBar}>
      <div className={styles.selectionSummary}>
        <strong>Selection</strong>
        <span>{selectedWords} words</span>
      </div>
      <div className={styles.selectionActions}>
        {actions.map((action) => (
          <button key={action.id} type="button" onClick={action.onSelect}>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
