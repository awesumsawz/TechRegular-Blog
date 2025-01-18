import { useState } from "react";

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
      // Start the URL scan by calling the API route
      const response = await fetch("/api/urlscan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to start scan");
      }

      const { uuid } = await response.json();

      // Start polling for the scan result
      pollScanResult(uuid);
    } catch (err) {
      setError("Failed to scan the URL. Please try again.");
      setLoading(false);
    }
  };

  const pollScanResult = async (uuid) => {
    try {
      const resultResponse = await fetch(`/api/urlscan?uuid=${uuid}`);

      if (resultResponse.status === 202) {
        // Scan is still pending, wait and poll again
        setTimeout(() => pollScanResult(uuid), 5000); // Retry after 5 seconds
      } else if (resultResponse.ok) {
        const result = await resultResponse.json();
        setScanResult(result);
        setLoading(false);
      } else {
        throw new Error("Failed to fetch scan result");
      }
    } catch (err) {
      setError("Failed to fetch scan result. Please try again.");
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
          <p>URL: {scanResult.page.url}</p>
          <p>Status: {scanResult.stats.status}</p>
          <p>IP Address: {scanResult.page.ip}</p>
          <p>Domain: {scanResult.page.domain}</p>
          {scanResult.request && scanResult.request.method && (
            <p>Method: {scanResult.request.method}</p>
          )}
          <p>Response Headers:</p>
					{scanResult.response && Object.entries(scanResult.response.headers).map(([key, value]) => (
						<p>{key}: {value}</p>
					))}
					<p>Request Headers:</p>
					{scanResult.request && Object.entries(scanResult.request.headers).map(([key, value]) => (
						<p key={key}>{key}: {value}</p>
					))}
					<p>Query Parameters:</p>
					{scanResult.page && Array.from(new URL(scanResult.page.url).searchParams).map(([key, value]) => (
						<p>{key}: {value}</p>
					))}
					<p>Redirections:</p>
					{scanResult.page && Array.from(scanResult.page.redirects).map((redirect, index) => (
						<p>{index + 1}: {redirect}</p>
					))}
        </div>
      )}
    </div>
  );
}