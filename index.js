require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

let urlDatabase = [];
let urlCounter = 1;

function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    if (!urlObj.protocol.match(/^https?:$/)) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;
  
  if (!isValidUrl(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  const existingUrl = urlDatabase.find(entry => entry.original_url === originalUrl);
  if (existingUrl) {
    return res.json({
      original_url: existingUrl.original_url,
      short_url: existingUrl.short_url
    });
  }

  const newUrl = {
    original_url: originalUrl,
    short_url: urlCounter
  };
  
  urlDatabase.push(newUrl);
  urlCounter++;

  res.json({
    original_url: newUrl.original_url,
    short_url: newUrl.short_url
  });
});

app.get('/api/shorturl/:shorturl', function(req, res) {
  const shortUrl = parseInt(req.params.shorturl);
  const urlEntry = urlDatabase.find(entry => entry.short_url === shortUrl);
  
  if (urlEntry) {
    res.redirect(urlEntry.original_url);
  } else {
    res.json({ error: 'invalid url' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
