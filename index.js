require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const dns = require("dns");
const { MongoClient, ServerApiVersion } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
// Send a ping to confirm a successful connection
const db = client.db("urlshortner");
const coll_urls = db.collection("urls");
// Basic Configuration
const port = process.env.PORT || 3000;

// Configuración de express-session

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

app.post("/api/shorturl", async function (req, res) {
  dns.lookup(new URL(req.body.url).hostname, async (err, address) => {
    if (!address) {
      res.json({ error: "invalid url" });
    } else {
      const urlCount = await coll_urls.countDocuments({});
      const urlDoc = {
        original_url: req.body.url,
        short_url: urlCount + 1,
      };

      coll_urls.insertOne(urlDoc);

      res.json(urlDoc);
    }
  });
});

app.get("/api/shorturl/:short_url", async function (req, res) {
  let short_url = parseInt(req.params.short_url);
  let urlFound = await coll_urls.findOne({ short_url });
  console.info(urlFound);
  if (urlFound.original_url) {
    res.redirect(urlFound.original_url);
    return;
  } else {
    res.json({ error: "No short URL found for the given input" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
