var donuts = ["glazed", "chocolate frosted", "Boston creme", "glazed cruller"];
donuts.splice(1, 1, "chocolate cruller", "creme de leche"); // birinchi indeksdagj "chocolate frosted" elementni o'chinadi va birinchi indeksdan boshlab "chocolate cruller" va "creme de leche" elementlarini go'shadi.

// Kod bloklarini chapga hizalash
document.querySelectorAll('pre, code').forEach(el => {
    el.style.marginLeft = '0';
    el.style.paddingLeft = '0';
    el.style.textAlign = 'left';
    
    // Matnni ham chapga hizalash
    el.textContent = el.textContent.trimStart();
  });