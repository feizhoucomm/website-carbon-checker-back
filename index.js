const express = require("express");
// const fetch = require('node-fetch');
const cors = require("cors");
const app = express();
const port = 3001; // You can use any port you prefer
// require detenv file :

require("dotenv").config();
console.log("process.env.CLIENT_SIDE");
console.log(process.env.CLIENT_SIDE);
app.use(
  cors({
    origin: [process.env.CLIENT_SIDE], // Replace with your actual frontend domain
    credentials: true,
    methods: ["GET"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 200, // Some legacy browsers (IE11, various Android versions) choke on 204
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
