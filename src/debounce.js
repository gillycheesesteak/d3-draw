export default function debounce(func, wait) {
  let timerId;

  return function debounced(...args) {
    if (timerId === undefined) {
      timerId = setTimeout(() => {
        timerId = undefined;
        func.apply(this, args);
      }, wait);
    }
  };
}
