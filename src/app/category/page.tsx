import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { getCategoriesGrouped } from "@/lib/api/categories";
import { generateBreadcrumbSchema, generateItemListSchema } from "@/schemas";
import { config } from "@/config/config";

export const metadata: Metadata = {
  title: "Categories | FAB Defense UK",
  description:
    "Browse all FAB Defense product categories. Premium tactical grips, buttstocks, bipods, magazines, sights, and holsters from the official UK retailer.",
};

interface CategoryParent {
  name: string;
  slug: string;
  _count: { products: number };
}

interface CategoryChild {
  name: string;
  slug: string;
  _count: { products: number };
}

interface CategoryGroup {
  parent: CategoryParent;
  children: CategoryChild[];
}

export default async function CategoriesPage() {
  const grouped: CategoryGroup[] = await getCategoriesGrouped();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", href: config.siteUrl },
    { name: "Categories", href: `${config.siteUrl}/category` },
  ]);

  const itemListSchema = generateItemListSchema({
    name: "FAB Defense Product Categories",
    url: `${config.siteUrl}/category`,
    description:
      "Browse all FAB Defense product categories. Premium tactical grips, buttstocks, bipods, magazines, sights, and holsters from the official UK retailer.",
    numberOfItems: grouped.length,
    items: grouped.map((group, i) => ({
      position: i + 1,
      name: group.parent.name,
      url: `${config.siteUrl}/category/${group.parent.slug}`,
    })),
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: itemListSchema }} />

      <PageHeader
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Categories", href: "/category" },
        ]}
        title="All Categories"
      />

      <div className="bg-white tactical-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
            {grouped.map(({ parent, children }) => (
              <div
                key={parent.slug}
                className="relative bg-content-surface border border-content-border hover:border-fab-aqua/30 transition-all duration-300 group"
              >
                {/* Parent category header */}
                <a
                  href={`/category/${parent.slug}`}
                  className="block p-5 border-b border-content-border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-fab-aqua text-[10px] uppercase tracking-widest mb-1">
                        Category
                      </p>
                      <h2 className="font-heading text-content-text font-bold uppercase tracking-wide text-lg group-hover:text-fab-aqua transition-colors duration-300">
                        {parent.name}
                      </h2>
                    </div>
                    <span className="text-content-text-muted font-mono text-xs">
                      {parent._count.products}
                    </span>
                  </div>
                </a>

                {/* Subcategories list */}
                {children.length > 0 ? (
                  <ul className="p-4 space-y-1">
                    {children.map((child) => (
                      <li key={child.slug}>
                        <a
                          href={`/category/${child.slug}`}
                          className="flex items-center justify-between py-2 px-3 text-sm font-body text-content-text-secondary hover:text-fab-aqua hover:bg-fab-aqua/5 transition-all duration-200"
                        >
                          <span>{child.name}</span>
                          <span className="font-mono text-[11px] text-content-text-muted">
                            {child._count.products}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4">
                    <a
                      href={`/category/${parent.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-body text-content-text-secondary hover:text-fab-aqua transition-colors duration-200"
                    >
                      Browse all {parent.name}
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </a>
                  </div>
                )}

                {/* Aqua left accent */}
                <div className="absolute top-0 left-0 bottom-0 w-0.5 bg-fab-aqua/40 group-hover:bg-fab-aqua transition-colors duration-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
