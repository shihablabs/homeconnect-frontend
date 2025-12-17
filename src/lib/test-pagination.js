
// Logic copied from pagination-utils.ts for verification to avoid TS compilation issues in quick test
function testPagination(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items = [];
  items.push(1);
  if (current > 3) items.push('ellipsis');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) {
    if (i > 1 && i < total) items.push(i);
  }
  if (current < total - 2) items.push('ellipsis');
  if (total > 1) items.push(total);
  return items;
}

console.log('Test 1 (Total 5, Curr 1):', testPagination(1, 5));
console.log('Test 2 (Total 10, Curr 1):', testPagination(1, 10));
console.log('Test 3 (Total 10, Curr 5):', testPagination(5, 10));
console.log('Test 4 (Total 10, Curr 9):', testPagination(9, 10));
console.log('Test 5 (Total 10, Curr 10):', testPagination(10, 10));
console.log('Test 6 (Total 20, Curr 10):', testPagination(10, 20));
