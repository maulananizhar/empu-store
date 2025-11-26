import { Button } from "@/components/ui/button";
import { Categories } from "@/generated/prisma/browser";
import * as LucideIcons from "lucide-react";

type LucideIconName = keyof typeof LucideIcons;

function isLucideIconName(name: string): name is LucideIconName {
  return name in LucideIcons;
}

function CategoryFilter({
  category,
  categoryId,
  setCategoryId,
}: {
  category: Categories;
  categoryId: number | undefined;
  setCategoryId: (categoryId: number | undefined) => void;
}) {
  const Icon = isLucideIconName(category.icon)
    ? (LucideIcons[category.icon] as React.ComponentType<{
        className?: string;
      }>)
    : LucideIcons.CircleAlert;
  return (
    <Button
      variant="outline"
      className={`transition-all duration-300 transform flex-shrink-0 ${
        categoryId === category.categoryId ? "bg-accent" : ""
      }`}
      onClick={() => {
        setCategoryId(category.categoryId);
      }}>
      <Icon className="mr-1 h-4 w-4" />
      <span>{category.name}</span>
    </Button>
  );
}

function CategoryFilterSkeleton() {
  return (
    <Button variant="outline">
      <LucideIcons.Loader className="text-gray-300 mr-1 h-4 w-4 animate-spin" />
      <div className="h-4 w-16 bg-gray-300 animate-pulse rounded" />
    </Button>
  );
}

function CategoryFilterDelete({
  categoryId,
  setCategoryId,
}: {
  categoryId: number | undefined;
  setCategoryId: (categoryId: number | undefined) => void;
}) {
  return (
    <Button
      variant="outline"
      onClick={() => {
        setCategoryId(undefined);
      }}
      className={`transition-all duration-300 transform flex-shrink-0 ${
        categoryId === undefined
          ? "opacity-0 w-0 p-0 border-0 pointer-events-none"
          : "opacity-100 w-auto"
      }`}>
      <LucideIcons.FunnelX className="mr-1 h-4 w-4" />
    </Button>
  );
}

export { CategoryFilter, CategoryFilterSkeleton, CategoryFilterDelete };
