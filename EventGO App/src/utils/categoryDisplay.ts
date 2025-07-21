export const getCategoryDisplayName = (category: string): string => {
  if (category === "All") return "All";
  return category
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
