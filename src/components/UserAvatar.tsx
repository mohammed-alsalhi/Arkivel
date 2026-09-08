type Props = {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-[12px]",
  lg: "w-10 h-10 text-[14px]",
};

const colors = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export default function UserAvatar({ name, size = "md", className = "" }: Props) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const colorIdx = hashCode(name) % colors.length;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold ${sizeMap[size]} ${colors[colorIdx]} ${className}`}
      title={name}
    >
      {initials}
    </span>
  );
}
