export function fmt(value) {
  return new Intl.NumberFormat().format(value);
}
