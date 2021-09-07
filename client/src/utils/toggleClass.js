export function toggleClass($element, className) {
  if ($element.classList.contains(className)) $element.classList.remove(className);
  else $element.classList.add(className);
}
