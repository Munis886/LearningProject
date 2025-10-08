function toggleMenu() {
  var menu = document.getElementById("menu");
  var content = document.getElementById("container");
  menu.classList.toggle("active");
  content.classList.toggle("shifted");
}
