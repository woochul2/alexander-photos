/**
 * rem 값을 px 값으로 바꾼다.
 *
 * @param {string | number} value
 */
export default (value) => {
  const html = document.documentElement;
  const htmlFontSize = window.getComputedStyle(html).fontSize;
  return parseFloat(value) * parseFloat(htmlFontSize);
};
