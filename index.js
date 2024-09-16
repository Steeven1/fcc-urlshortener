require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const dns = require("dns");
const session = require("express-session");

// Basic Configuration
const port = process.env.PORT || 3000;

// Configuración de express-session
app.use(
  session({
    secret: "clave-secreta", // Usar una clave secreta para firmar las cookies de la sesión
    resave: false, // No volver a guardar la sesión si no ha cambiado
    saveUninitialized: true, // Guardar nuevas sesiones aunque no se hayan modificado
    cookie: { secure: false }, // secure: true solo si usas HTTPS
  }),
);
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", function (req, res) {
  if (!req.session.urls) {
    req.session.urls = [];
  }
  dns.lookup(new URL(req.body.url).hostname, (err, address) => {
    if (!address) {
      res.json({ error: "invalid url" });
    } else {
      req.session.urls.push({
        original_url: req.body.url,
        short_url: req.session.urls.length + 1,
      });
      res.json(
        req.session.urls.find((url) => url.original_url === req.body.url),
      );
    }
  });
});

app.get("/api/shorturl/:short_url", function (req, res) {
  let short_url = req.params.short_url;
  let urlFound = req.session.urls?.find((url) => url.short_url === +short_url);
  console.info(urlFound);
  res.json(urlFound);
  if (urlFound.original_url) {
    res.redirect(urlFound.original_url);
  } else {
    res.json({ error: "No short URL found for the given input" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
