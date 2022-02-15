/**
 * 스크롤바의 너비를 구한다.
 */
export default () => {
  const el = document.createElement('div');
  el.style.visibility = 'hidden';
  el.style.overflow = 'scroll';
  document.body.appendChild(el);
  const scrollbarWidth = el.offsetWidth - el.clientWidth;
  document.body.removeChild(el);
  return scrollbarWidth;
};
