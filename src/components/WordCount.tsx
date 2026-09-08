type Props = {
  html: string;
};

export default function WordCount({ html }: Props) {
  const text = html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const words = text ? text.split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.ceil(words / 200));

  return (
    <span className="text-[11px] text-muted">
      {words.toLocaleString()} words &middot; {minutes} min read
    </span>
  );
}
