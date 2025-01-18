// pages/api/urlscan.js

import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { url } = req.body;

    const URLSCAN_API_KEY = process.env.URLSCAN_API_KEY;

    if (!URLSCAN_API_KEY) {
      res.status(500).json({ error: "URLSCAN_API_KEY is not defined in environment variables." });
      return;
    }

    try {
      const response = await axios.post(
        "https://urlscan.io/api/v1/scan/",
        { url, visibility: "public" },
        {
          headers: {
            "Content-Type": "application/json",
            "API-Key": URLSCAN_API_KEY,
          },
        }
      );

      res.status(200).json({ uuid: response.data.uuid });
    } catch (error) {
      console.error("Error scanning URL:", error.response?.data || error.message);
      res.status(500).json({ error: "Error scanning URL." });
    }
  } else if (req.method === "GET") {
    const { uuid } = req.query;

    try {
      const response = await axios.get(`https://urlscan.io/api/v1/result/${uuid}/`);
      res.status(200).json(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Scan is not finished yet
        res.status(202).json({ status: "pending" });
      } else {
        console.error("Error fetching scan result:", error.response?.data || error.message);
        res.status(500).json({ error: "Error fetching scan result." });
      }
    }
  } else {
    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}