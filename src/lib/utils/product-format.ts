/**
 * Utility functions for product display formatting
 */

/**
 * Strips "FAB Defense" prefix from product names
 * Since all products are FAB Defense products, we remove the leading brand name
 * for cleaner display on the FAB Defense UK site
 */
export function formatProductName(name: string): string {
  if (!name || typeof name !== 'string') {
    return name;
  }
  
  // Remove "FAB Defense" prefix (case-insensitive, with optional space after)
  return name.replace(/^FAB Defense\s*/i, '');
}

/**
 * Formats product name for display in HTML attributes (alt tags, etc.)
 * Ensures proper escaping while applying name formatting
 */
export function formatProductNameForAttribute(name: string): string {
  const formattedName = formatProductName(name);
  return formattedName.replace(/"/g, '&quot;');
}
