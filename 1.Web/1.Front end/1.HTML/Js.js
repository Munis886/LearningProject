function toggleMenu() {
  var menu = document.getElementById("menu");
  var content = document.getElementById("container");
  menu.classList.toggle("active");
  content.classList.toggle("shifted");
}

function toggleSubMenu(id, button) {
  var subMenu = document.getElementById(id);
  var isOpen = subMenu && subMenu.style.display === "block";
  if (subMenu) {
    subMenu.style.display = isOpen ? "none" : "block";
  }
  if (button) {
    button.classList.toggle("open", !isOpen);
  }
}

