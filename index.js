const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const app = express();
const port = 3001;

require("dotenv").config();

app.use(
  cors({
    origin: [
      "https://website-carbon-checker-front-bubbxdj3b-feizhoucom.vercel.app",
      "https://website-carbon-checker-front.vercel.app",
    ],
    credentials: true,
    methods: ["GET"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to websites carbon calculator!",
  });
});

app.get("/carbon", async (req, res) => {
  const { url } = req.query;

  try {
    const response = await fetch(
      `${process.env.CARBON_API}/site?url=${encodeURIComponent(url)}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching data" });
  }
});

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
