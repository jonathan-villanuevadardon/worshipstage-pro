export function serviceDateKey(value) {
  if (typeof value === 'string') {
    const match = value.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function sortServicesChronologically(services = []) {
  return [...services].sort((a, b) => {
    const dateComparison = serviceDateKey(a.date).localeCompare(serviceDateKey(b.date));
    if (dateComparison !== 0) return dateComparison;
    return String(a.start_time || '').localeCompare(String(b.start_time || ''));
  });
}
