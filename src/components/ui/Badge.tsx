interface BadgeProps {
  text: string;
  color?: string; // ex: "blue", "green", "red"
}

export const Badge = ({ text, color = "blue" }: BadgeProps) => {
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    purple: "bg-purple-100 text-purple-700"
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded-md font-semibold ${colors[color]}`}
    >
      {text}
    </span>
  );
};
