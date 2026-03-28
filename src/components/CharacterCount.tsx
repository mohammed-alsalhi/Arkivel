interface Props {
  html: string;
}

export default function CharacterCount({ html }: Props) {
  const count = html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().length;
  const formatted = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count.toString();
  return <span title={`${count.toLocaleString()} characters`}>{formatted} chars</span>;
}
