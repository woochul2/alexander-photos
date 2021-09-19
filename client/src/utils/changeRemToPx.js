export function changeRemToPx(remVal) {
  const htmlFontSize = window.getComputedStyle(document.documentElement).getPropertyValue('font-size');
  return parseFloat(remVal) * parseFloat(htmlFontSize);
}
