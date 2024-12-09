import axios from "axios";

const URLSCAN_API_KEY = process.env.URLSCAN_API_KEY;

if (!URLSCAN_API_KEY) {
  throw new Error("URLSCAN_API_KEY is required in .env.local");
}

const urlScanAPI = axios.create({
  baseURL: "https://urlscan.io/api/v1/",
  headers: {
    "Content-Type": "application/json",
    "API-Key": URLSCAN_API_KEY,
  },
});

export const scanURL = async (url) => {
  try {
    const response = await urlScanAPI.post("/scan/", {
      url,
      visibility: "public", // or 'private' depending on your preference
    });
    return response.data;
  } catch (error) {
    console.error("Error scanning URL:", error.response?.data || error.message);
    throw error;
  }
};

export const getScanResult = async (uuid) => {
  try {
    const response = await urlScanAPI.get(`/result/${uuid}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching scan result:", error.response?.data || error.message);
    throw error;
  }
};