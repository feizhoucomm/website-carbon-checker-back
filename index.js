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
    origin: "*", // Allow requests from any origin
    credentials: true,
    methods: ["GET"],
    allowedHeaders: ["Content-Type"],
  })
);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to websites carbon calculator!",
  });
});
app.get("/test",async (req, res) => {
  try {
    const response = await fetch(
      `${process.env.CARBON_API}/site?url=${encodeURIComponent("https://feizhoucom.com")}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching data" });
  }
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
