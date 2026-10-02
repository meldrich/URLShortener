require('dotenv').config();
const express = require('express');
const dns = require('dns');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// URL Shortener
const urlDatabase = [];

app.post('/api/shorturl', function(req, res) {
  const input = req.body.url;
  let parsed;

  try {
    parsed = new URL(input);
  } catch (e) {
    return res.json({ error: 'invalid url' });
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(parsed.hostname, function(err) {
    if (err) return res.json({ error: 'invalid url' });

    let index = urlDatabase.indexOf(input);
    if (index === -1) {
      urlDatabase.push(input);
      index = urlDatabase.length - 1;
    }

    res.json({ original_url: input, short_url: index + 1 });
  });
});

app.get('/api/shorturl/:short_url', function(req, res) {
  const original = urlDatabase[parseInt(req.params.short_url, 10) - 1];
  if (!original) {
    return res.json({ error: 'No short URL found for the given input' });
  }
  res.redirect(original);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
