import { Chip } from "@/components/ui";

type Variant = "default" | "accent" | "success" | "warning" | "danger";

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  size?: "sm" | "md";
};

export default function Badge({ children, variant = "default", size = "md" }: Props) {
  const tone = variant === "accent" ? "info" : variant;

  return (
    <Chip className={size === "sm" ? "badge-sm" : undefined} tone={tone}>
      {children}
    </Chip>
  );
}
