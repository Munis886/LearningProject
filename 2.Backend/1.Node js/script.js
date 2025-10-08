function toggleMenu() {
  var menu = document.getElementById("menu");
  var content = document.getElementById("container");
  menu.classList.toggle("active");
  content.classList.toggle("shifted");
}

function toggleSubMenu(id) {
  var subMenu = document.getElementById(id);
  if (subMenu.style.display === "block") {
    subMenu.style.display = "none"; // Yashirish
  } else {
    subMenu.style.display = "block"; // Ko'rsatish
  }
}

document.getElementById('code').textContent = 
        document.getElementById('code').textContent
            .replace(/  +/g, ' '); // 2+ probelni 1 ga almashtiradi

