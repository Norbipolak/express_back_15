/*A formidable() egy olyan módszer, amelyet a Node.js-ben használnak a "formidable" csomag részeként. 
Ez egy népszerű könyvtár a fájl feltöltések és az űrlapadatok feldolgozására a beérkező HTTP kérésekből, különösen akkor, ha 
multipart/form-data formátumúak (ez az adatküldési típus a fájlfeltöltésekhez van használva).

A formidable() főbb jellemzői:

Fájl feltöltés kezelése:

Lehetővé teszi a multipart/form-data formátum kezelését, amelyet a fájlfeltöltéskor használnak a webes űrlapokon keresztül.
Beérkező űrlapadatok elemzése:

Képes mind fájlokat, mind mezőket (szöveges adatokat) feldolgozni, amelyeket az űrlapon keresztül küldenek be, megkönnyítve ezzel az űrlapfeldolgozást a Node.js alkalmazásokban.
Nagy fájlok kezelése:

Képes kezelni nagy fájlfeltöltéseket azáltal, hogy a fájlokat a feltöltés során közvetlenül lemezre írja, így elkerülve a memória túlterhelését.
Formidable használatának példája:
*/
const formidable = require('formidable');
const http = require('http');
const fs = require('fs');

http.createServer((req, res) => {
  if (req.method.toLowerCase() === 'post') {
    // Létrehozunk egy új formidable.IncomingForm() példányt
    const form = new formidable.IncomingForm();

    // Elemzi a beérkező űrlapadatokat
    form.parse(req, (err, fields, files) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Hiba történt');
        return;
      }

      // Fields tartalmazza az űrlap szokásos mezőit
      console.log('Mezők:', fields);

      // Files tartalmazza a feltöltött fájlokat
      console.log('Feltöltött fájl:', files.upload);

      // Válasz a kliensnek
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Űrlap feldolgozva.');
    });
  } else {
    // Egyszerű űrlap kiszolgálása fájl feltöltéséhez
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <form action="/" method="post" enctype="multipart/form-data">
        <input type="file" name="upload" /><br/>
        <input type="submit" value="Feltöltés" />
      </form>
    `);
  }
}).listen(8080);

/*
Hogyan működik:
Űrlap létrehozása: Létrehozunk egy formidable.IncomingForm() objektumot.
Űrlapadatok elemzése: A parse() metódussal fájlokat és szöveges mezőket egyaránt feldolgozhatunk.
Fájlok kezelése: A formidable automatikusan a fájlokat ideiglenes mappákba menti, és metaadatokat szolgáltat a files objektumon keresztül.

A Formidable előnyei:
Egyszerű több részes űrlapok kezelése: Nagyszerű választás fájlfeltöltést tartalmazó űrlapok kezelésére.
Skálázhatóság nagy fájlokra: Képes nagy fájlok feltöltését kezelni anélkül, hogy a memóriát túlterhelné.
Streamelés támogatása: A fájlok közvetlenül a fájlrendszerbe tölthetők fel, miközben feltöltésre kerülnek.

Mikor érdemes használni:
Fájlfeltöltések webes alkalmazásokban (pl. képek, dokumentumok, videók).
Komplex űrlapbeküldések kezelése, amikor fájlokat és szöveges adatokat egyaránt fel kell dolgozni a felhasználóktól.
A formidable() kiválóan alkalmas Node.js alkalmazásokhoz, amelyekben fájl feltöltésére van szükség, és biztosítja a hatékony és megbízható fájlkezelést.
*/