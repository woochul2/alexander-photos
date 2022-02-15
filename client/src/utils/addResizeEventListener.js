/**
 * resize 이벤트 발생 시 실행할 이벤트 리스너를 등록한다.
 *
 * 모바일에서 모드(가로, 세로)가 변한 직후
 * resize 이벤트 리스너만으로 innerHeight, innerWidth 값을 구하면,
 * 변하기 이전의 값을 가져올 때가 있기 때문에 orientationchange 이벤트도 등록한다.
 * setTimeout으로 1ms 딜레이를 주면 제대로 값을 받아온다.
 *
 * @param {function} listener
 */
export default (listener) => {
  window.addEventListener('resize', listener);
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      listener();
    }, 1);
  });
};
