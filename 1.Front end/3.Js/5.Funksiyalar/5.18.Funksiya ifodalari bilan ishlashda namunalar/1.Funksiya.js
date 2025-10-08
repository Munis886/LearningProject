// catSays funksiya ifodasi
var catSays = function(max) {
    var catMessage = "";
    for (var i = 0; i < max; i++) {
      catMessage += "meow ";
    }
    return catMessage;
  };
  
  // helloCat funksiya e’loni qayta chaqiruvchiga murojaat qilmoqda
  function helloCat(callbackFunc) {
    return "Hello " + callbackFunc(3);
  }
  
  // qayta chaqiruvchi funksiya sifatida catSays o‘tkazilmoqda
  helloCat(catSays);