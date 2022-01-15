export function getWindowHeight() {
  // 모바일에서 zoom한 상태에서는 window.innerHeight가 원래 값과 다르기 때문에 zoomRatio를 구했다.
  // bodyRect.height는 모바일 주소창을 포함한 높이인데, 주소창을 제외한 window 높이를 구하고 싶었다.
  const bodyRect = document.body.getBoundingClientRect();
  const zoomRatio = bodyRect.width / window.innerWidth;
  return window.innerHeight * zoomRatio;
}
