
export function generatePaginationItems(currentPage: number, totalPages: number) {
  // If total pages is small, show all
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: (number | 'ellipsis')[] = [];

  // Always show first page
  items.push(1);

  // Logic for ellipses
  // We want to show current page, +1, -1 neighbours
  // But also first and last page.

  if (currentPage > 3) {
    items.push('ellipsis');
  }

  // Neighbours
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    // Avoid duplicating 1 or totalPages if the range inadvertently covers them
    // (Though logic above separates them safely usually)
    if (i > 1 && i < totalPages) {
      items.push(i);
    }
  }

  if (currentPage < totalPages - 2) {
    items.push('ellipsis');
  }

  // Always show last page
  if (totalPages > 1) {
    items.push(totalPages);
  }

  return items;
}
