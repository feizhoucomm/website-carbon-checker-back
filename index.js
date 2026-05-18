const express = require("express");
const cors = require("cors");

const app = express();
const port = 3001;

require("dotenv").config();

app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to websites carbon calculator!",
  });
});

/**
 * Convert bytes to MB
 */
const bytesToMB = (bytes) => {
  return bytes / 1024 / 1024;
};

/**
 * Generate eco rating
 */
const getRating = (score) => {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "E";
};

/**
 * Fake cleanerThan estimation
 */
const getCleanerThan = (score) => {
  return Math.min(score / 100, 0.98);
};

app.get("/carbon", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      error: "URL is required",
    });
  }

let normalizedUrl = url;

if (
  !normalizedUrl.startsWith("http://") &&
  !normalizedUrl.startsWith("https://")
) {
  normalizedUrl = `https://${normalizedUrl}`;
}

  try {
    const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
      normalizedUrl,
    )}&key=${process.env.GOOGLE_PAGE_SPEED_API}`;
    // console.log("\n\n\n==========================\n\n\n");
    // console.log(endpoint)
    // console.log("\n\n\n==========================\n\n\n");
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error("Failed to fetch PageSpeed data");
    }

    const result = await response.json();

    const lighthouse = result?.lighthouseResult;

    if (!lighthouse) {
      throw new Error("Invalid Lighthouse response");
    }

    // Performance score
    const performanceScore =
      (lighthouse?.categories?.performance?.score || 0) * 100;

    // Total page weight
    const totalByteWeight =
      lighthouse?.audits?.["total-byte-weight"]?.numericValue || 0;

    const totalMB = bytesToMB(totalByteWeight);

    // Network requests
    const requests =
      lighthouse?.audits?.["network-requests"]?.details?.items?.length || 0;

    /**
     * VERY SIMPLE ESTIMATION FORMULAS
     * You can improve these later
     */

    // Estimated energy usage
    const energy = totalMB * 0.00008;

    // Estimated CO2
    const co2Grid = energy * 442;
    const co2Renewable = energy * 50;

    // Rating
    const rating = getRating(performanceScore);

    // Cleaner than
    const cleanerThan = getCleanerThan(performanceScore);

    /**
     * Recommendations
     */
    const audits = lighthouse?.audits || {};

    const recommendations = Object.values(audits)
      .filter(
        (audit) =>
          audit.score !== null &&
          audit.score < 0.9 &&
          audit.title &&
          audit.description,
      )
      .slice(0, 5)
      .map((audit) => ({
        title: audit.title,
        description: audit.description,
      }));

    /**
     * Final frontend-friendly response
     */
    const transformedData = {
      url,

      rating,

      cleanerThan,

      statistics: {
        energy,

        co2: {
          grid: {
            grams: co2Grid,
          },

          renewable: {
            grams: co2Renewable,
          },
        },
      },

      performance: {
        score: performanceScore,
        pageWeightMB: totalMB,
        requests,
      },

      recommendations,

      isEstimate: true,
    };

    res.json(transformedData);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message || "Error fetching data",
    });
  }
});

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
