"use client";

interface Category {
  slug: string;
  name: string;
}

interface SortOption {
  value: string;
  label: string;
}

interface Props {
  categories: Category[];
  currentSort: string;
  currentCategory?: string;
}

const sortOptions: SortOption[] = [
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "price-asc", label: "Price Low-High" },
  { value: "price-desc", label: "Price High-Low" },
  { value: "newest", label: "Newest" },
];

export default function ShopFilters({
  categories,
  currentSort,
  currentCategory,
}: Props) {
  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const url = new URL(window.location.href);
    url.searchParams.set("sort", e.target.value);
    window.location.href = url.toString();
  }

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (e.target.value) {
      window.location.href = e.target.value;
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 bg-white border border-content-border px-5 py-3.5">
      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex items-center gap-3">
          <label
            htmlFor="category-select"
            className="text-content-text-muted text-[10px] font-mono font-bold uppercase tracking-widest whitespace-nowrap"
          >
            Category
          </label>
          <select
            id="category-select"
            value={currentCategory ? `/category/${currentCategory}` : ""}
            onChange={handleCategoryChange}
            className="bg-white text-content-text text-sm font-body border border-content-border rounded-none px-3 py-2 focus:outline-none focus:border-fab-aqua focus:ring-1 focus:ring-fab-aqua/30 transition-colors cursor-pointer appearance-none pr-8"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={`/category/${cat.slug}`}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Sort dropdown */}
      <div className="flex items-center gap-3">
        <label
          htmlFor="sort-select"
          className="text-content-text-muted text-[10px] font-mono font-bold uppercase tracking-widest whitespace-nowrap"
        >
          Sort by
        </label>
        <select
          id="sort-select"
          value={currentSort}
          onChange={handleSortChange}
          className="bg-white text-content-text text-sm font-body border border-content-border rounded-none px-3 py-2 focus:outline-none focus:border-fab-aqua focus:ring-1 focus:ring-fab-aqua/30 transition-colors cursor-pointer appearance-none pr-8"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
