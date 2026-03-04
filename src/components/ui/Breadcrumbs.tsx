interface BreadcrumbItem {
  name: string;
  href: string;
}

interface Props {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-content-text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.href} className="flex items-center gap-1.5">
              {index > 0 && (
                <span className="text-content-border select-none" aria-hidden="true">
                  /
                </span>
              )}
              {isLast ? (
                <span className="font-semibold text-content-text" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <a
                  href={item.href}
                  className="hover:text-fab-aqua transition-colors duration-200"
                >
                  {item.name}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
