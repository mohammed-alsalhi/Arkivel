import Badge from "./Badge";

type Props = {
  status: string;
};

export default function ArticleStatusBadge({ status }: Props) {
  switch (status) {
    case "draft":
      return <Badge variant="warning" size="sm">Draft</Badge>;
    case "review":
      return <Badge variant="accent" size="sm">Review</Badge>;
    case "published":
      return <Badge variant="success" size="sm">Published</Badge>;
    default:
      return <Badge size="sm">{status}</Badge>;
  }
}
