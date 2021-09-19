export function throttle(func, timeout) {
  let lastTime = 0;
  return function (event) {
    let now = new Date().getTime();
    if (now - lastTime > timeout) {
      func(event);
      lastTime = now;
    }
  };
}
