require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require("dns");
const bodyParser = require("body-parser");

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

//local database
let urlDatabase = [];
let counter = 1;

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Recorta la url
app.post('/api/shorturl', (req, res) => {

  const { url } = req.body;
  
  try {

    //Validar url
    const urlObj = new URL(url);

    //Verificar el dominio
    dns.lookup(urlObj.hostname, (err) => {
      if(err) {
        return res.json({ error: "invalid url"})
      }

      //Buscar si existe
      const foundUrl = urlDatabase.find((entry) => entry.original_url === url);
      if (foundUrl) {
        return res.json({ original_url: foundUrl.original_url, short_url: foundUrl.short_url })
      }

      //Crear nueva URL cortada
      const newEntry = { original_url: url, short_url: counter++ };
      urlDatabase.push(newEntry);

      res.json(newEntry);
    });
  } catch (error) {
    res.json({ error: "invalid url"})
  }
})

app.get('/api/shorturl/:short_url', (req, res) => { 
  const shortUrlId = parseInt(req.params.short_url, 10); // Convertir el short_url a un número entero
  
  const foundUrl = urlDatabase.find((entry) => entry.short_url === shortUrlId);

  if(foundUrl) {
    return res.redirect(foundUrl.original_url);
  } else {
    return res.json({ error: "No short URL found" });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
