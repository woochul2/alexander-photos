export function changePxToRem(pxVal) {
  const htmlFontSize = window.getComputedStyle(document.documentElement).getPropertyValue('font-size');
  return parseFloat(pxVal) / parseFloat(htmlFontSize);
}
