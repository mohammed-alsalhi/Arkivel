import { reviewStatusLabel } from "@/lib/reviews";

type Props = {
  status: string;
};

export default function ReviewStatusBadge({ status }: Props) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    in_review: "bg-blue-100 text-blue-800 border border-blue-300",
    approved: "bg-green-100 text-green-800 border border-green-300",
    changes_requested: "bg-red-100 text-red-800 border border-red-300",
    rejected: "bg-gray-100 text-gray-600 border border-gray-300",
  };

  const cls =
    styles[status] ?? "bg-gray-100 text-gray-600 border border-gray-300";

  return (
    <span className={`px-2 py-0.5 text-[11px] font-medium rounded ${cls}`}>
      {reviewStatusLabel(status)}
    </span>
  );
}
