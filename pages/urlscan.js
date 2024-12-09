import { useState } from "react";
import { scanURL, getScanResult } from "../utils/urlScan";

export default function URLScanPage() {
  const [url, setUrl] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScan = async () => {
    setLoading(true);
    setError("");
    setScanResult(null);

    try {
      const scanResponse = await scanURL(url);
      const uuid = scanResponse.uuid;

      // Optionally fetch the result after a delay
      setTimeout(async () => {
        const result = await getScanResult(uuid);
        setScanResult(result);
        setLoading(false);
      }, 5000); // Adjust delay as needed
    } catch (err) {
      setError("Failed to scan the URL. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>URL Scanner</h1>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter a URL to scan"
        style={{ width: "300px", padding: "10px", marginRight: "10px" }}
      />
      <button onClick={handleScan} style={{ padding: "10px" }}>
        Scan URL
      </button>

      {loading && <p>Scanning in progress...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {scanResult && (
        <div>
          <h2>Scan Result</h2>
          <pre>{JSON.stringify(scanResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}