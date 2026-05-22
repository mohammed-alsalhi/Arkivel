import { EmptyState as UiEmptyState, LinkButton } from "@/components/ui";

type Props = {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
};

export default function EmptyState({ icon, title, description, actionLabel, actionHref }: Props) {
  return (
    <UiEmptyState
      icon={icon}
      title={title}
      description={description}
      actions={
        actionLabel && actionHref ? (
          <LinkButton href={actionHref} variant="primary">
            {actionLabel}
          </LinkButton>
        ) : null
      }
    />
  );
}
