function toggle($element) {
  if ($element.tabIndex === -1) $element.removeAttribute('tabIndex');
  else $element.tabIndex = -1;
}

export function toggleMainTabIndex() {
  const $photos = document.querySelectorAll('.photo');
  $photos.forEach(($photo) => {
    toggle($photo);
  });

  const $uploadButton = document.querySelector('.upload-btn');
  toggle($uploadButton);

  const $githubIcon = document.querySelector('.github-icon');
  toggle($githubIcon);
}
