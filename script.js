function toggleTheme() {
  const body = document.body;
  if (body.classList.contains("light")) {
    body.classList.remove("light");
    body.classList.add("dark");
  } else {
    body.classList.remove("dark");
    body.classList.add("light");
  }
}

function updatePostType() {
  const select = document.getElementById("type-select");
  const postType = document.getElementById("post-type");
  postType.textContent = `[${select.value}]`;
}
