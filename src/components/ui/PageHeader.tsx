import Breadcrumbs from "@/components/ui/Breadcrumbs";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface Props {
  breadcrumbs: BreadcrumbItem[];
  title?: string;
  total?: number;
  countId?: string;
  description?: string;
}

// Note: description comes from the database (category_overrides or category.description),
// trusted server-side content — not user-supplied input.
export default function PageHeader({
  breadcrumbs,
  title,
  total,
  countId,
  description,
}: Props) {
  return (
    <div className="bg-fab-aqua/10 tactical-grid border-b border-content-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6">
        <Breadcrumbs items={breadcrumbs} />

        {title && (
          <h1 className="font-heading text-3xl md:text-4xl font-black text-content-text uppercase tracking-tight mt-4">
            {title}
          </h1>
        )}

        {total !== undefined && (
          <p className="text-content-text-secondary text-sm mt-4 font-semibold">
            {countId ? <span id={countId}>{total}</span> : total}{" "}
            {total === 1 ? "product" : "products"}
          </p>
        )}

        {description && (
          <div
            /* eslint-disable-next-line react/no-danger */
            dangerouslySetInnerHTML={{ __html: description }}
            className="text-content-text-secondary text-base leading-relaxed mt-3 font-body"
          />
        )}
      </div>
    </div>
  );
}
