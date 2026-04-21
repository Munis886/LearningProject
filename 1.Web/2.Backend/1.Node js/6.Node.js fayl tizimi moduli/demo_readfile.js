var http = require('http');
var fs = require('fs');
var path = require('path');

http.createServer(function (req, res) {
  // Faylning to'liq yo'lni olish
  const filePath = path.join(__dirname, 'demofile1.html');
  
  fs.readFile(filePath, function(err, data) {
    if (err) {
      // Xatolikni qayta ishlash
        res.writeHead(404, {'Content-Type': 'text/html'});
        return res.end("404 - Fayl topilmadi");
    }
    
    res.writeHead(200, {'Content-Type': 'text/html'});
    // Buffer ma'lumotlarini stringga o'tkazish
    res.write(data.toString());
    return res.end();
  });
}).listen(8080, () => {
  console.log('Server 8080-portda ishga tushdi');
});