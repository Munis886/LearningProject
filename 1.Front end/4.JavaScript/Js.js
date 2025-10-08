// function toggleMenu() {
//   var menu = document.getElementById("menu");
//   var content = document.getElementById("container");
//   menu.classList.toggle("active");
//   content.classList.toggle("shifted");
// }

function toggleSubMenu(id) {
  var subMenu = document.getElementById(id);
  if (subMenu.style.display === "block") {
    subMenu.style.display = "none"; // Yashirish
  } else {
    subMenu.style.display = "block"; // Ko'rsatish
  }
}

// Sahifa yuklanganda menyu holatini tiklash
window.addEventListener('DOMContentLoaded', function() {
  var menu = document.getElementById("menu");
  var content = document.getElementById("container");
  if (localStorage.getItem('menuActive') === 'true') {
    menu.classList.add("active");
    content.classList.add("shifted");
  }
});


// toggleMenu funksiyasini o'zgartiring:
function toggleMenu() {
  var menu = document.getElementById("menu");
  var content = document.getElementById("container");
  menu.classList.toggle("active");
  content.classList.toggle("shifted");
  // Holatni saqlash
  localStorage.setItem('menuActive', menu.classList.contains("active"));
}

// ...existing code...


