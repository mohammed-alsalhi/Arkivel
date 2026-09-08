type Props = {
  text: string;
  children: React.ReactNode;
  position?: "top" | "bottom";
};

export default function Tooltip({ text, children, position = "top" }: Props) {
  const posClass = position === "bottom"
    ? "top-[calc(100%+6px)] bottom-auto"
    : "";

  return (
    <span className="tooltip-wrapper">
      {children}
      <span className={`tooltip ${posClass}`}>{text}</span>
    </span>
  );
}
