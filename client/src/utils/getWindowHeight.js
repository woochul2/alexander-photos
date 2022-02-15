/**
 * 모바일에서 화면을 확대한 뒤 다음과 같이 비동기로 innerHeight 값을 구했을 때,
 *
 * setTimeout(() => {
 *   alert(window.innerHeight);
 * }, 1000);
 *
 * 확대하기 이전의 원래 innerHeight는 664라면,
 * 확대한 상태에서 비동기로 구한 innerHeight는 그보다 줄어든 250과 같은 값이 된다.
 * 이러한 모바일 상황에 대비하기 위해 사용하는 함수이다.
 *
 * @returns 주소창을 제외한 화면 높이
 */
export default () => {
  const rootWidth = document.documentElement.clientWidth;
  const zoomRatio = rootWidth / window.innerWidth;
  return window.innerHeight * zoomRatio;
};
