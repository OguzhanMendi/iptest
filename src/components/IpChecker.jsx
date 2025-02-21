import { useState } from "react";
import {
  Button,
  TextField,
  Card,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import axios from "axios";

// Server-side data fetching
export async function getServerSideProps(context) {
  try {
    const ipResponse = await fetch(
      "https://ipinfo.io/json?token=faac19cdc35949"
    );
    const ipData = await ipResponse.json();
    return {
      props: { ipData },
    };
  } catch (error) {
    console.error("IP data fetch error:", error);
    return {
      props: { ipData: null },
    };
  }
}

export default function IpChecker({ ipData }) {
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("");
  const [userIpData, setUserIpData] = useState(ipData || null);
  const [loading, setLoading] = useState(false);
  const [speedValue, setSpeedValue] = useState(null);
  const [speedDisplay, setSpeedDisplay] = useState("");
  const [error, setError] = useState("");
  const [bannerColor, setBannerColor] = useState("");
  const [portStatus, setPortStatus] = useState("");

  // Check IP, speed, and port
  const handleCheckAll = async () => {
    if (!ip) {
      setError("Please enter an IP address.");
      return;
    }
    setError("");
    setLoading(true);
    setPortStatus("");

    try {
      // IP check
      const ipResponse = await fetch(
        `https://ipinfo.io/${ip}?token=faac19cdc35949`
      );
      const ipData = await ipResponse.json();

      if (ipData.error) {
        setError("Invalid IP address.");
        setUserIpData(null);
      } else {
        setUserIpData({
          ip: ipData.ip,
          city: ipData.city,
          region: ipData.region,
          country: ipData.country,
          isp: ipData.org,
          hostname: ipData.hostname || "Unknown",
          type: ipData.bogon ? "Invalid IP" : "Potential Dynamic IP",
        });
      }

      // Internet speed test
      await checkInternetSpeed();

      // Port check
      if (port) {
        await checkPort(ip, port);
      }
    } catch (err) {
      setError("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Check internet speed
  const checkInternetSpeed = async () => {
    setSpeedDisplay("Measuring...");
    const startTime = Date.now();

    try {
      const response = await fetch(
        "https://speed.cloudflare.com/__down?bytes=10000000"
      );
      if (!response.ok) throw new Error("Speed test failed");

      const duration = (Date.now() - startTime) / 1000;
      const speedMbps = (10 / duration) * 8; // Mbps

      setSpeedValue(speedMbps);
      setSpeedDisplay(speedMbps.toFixed(2) + " Mbps");

      // Set banner color based on speed
      if (speedMbps < 20) {
        setBannerColor("bg-red-500");
      } else if (speedMbps > 75) {
        setBannerColor("bg-green-500");
      } else {
        setBannerColor("bg-yellow-500");
      }
    } catch (error) {
      setSpeedDisplay("Could not measure");
      setBannerColor("bg-gray-500");
    }
  };

  // Check port
  const checkPort = async (ip, port) => {
    try {
      const response = await axios.post("https://portchecker.io/api/query", {
        ip: ip,
        port: port,
      });

      const result = response.data;
      if (result.open) {
        setPortStatus(`✅ Port ${port} is open!`);
      } else {
        setPortStatus(`❌ Port ${port} is closed!`);
      }
    } catch (error) {
      setPortStatus("⚠️ Port check failed.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-300 to-blue-500">
      {/* RMOS Software Advertisement Banner */}
      <div className="w-full p-4 text-center text-white font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-pulse">
        <Typography variant="h6">
          💡 Why haven't you switched to RMOS POS System yet? 💻
        </Typography>
      </div>

      <Card className="p-4 w-full sm:w-1/2 md:w-1/4 shadow-2xl bg-white rounded-lg mt-4">
        <Typography variant="h5" className="text-center font-bold mb-4">
          🌍 <span className="text-blue-600">IP Check and Speed Test</span>
        </Typography>

        <div className="flex flex-col sm:flex-row gap-2 mb-2 justify-center items-center">
          <TextField
            fullWidth
            label="Enter IP address"
            variant="outlined"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            className="mb-2 sm:mb-0"
          />
          <TextField
            fullWidth
            label="Enter port number"
            variant="outlined"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="mb-2 sm:mb-0"
          />
          <Button
            variant="contained"
            color="error"
            onClick={handleCheckAll}
            disabled={loading}
            className="flex items-center justify-center mt-2 sm:mt-0"
            size="large"
          >
            🚀 TEST
          </Button>
        </div>

        {error && <Alert severity="error">{error}</Alert>}
        {loading && <CircularProgress className="mx-auto my-4" />}

        {userIpData && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-lg">
            <Typography variant="h6">🌐 IP Information</Typography>
            <Typography>📡 IP: {userIpData.ip}</Typography>
            <Typography>🌆 City: {userIpData.city}</Typography>
            <Typography>📍 Region: {userIpData.region}</Typography>
            <Typography>🌍 Country: {userIpData.country}</Typography>
            <Typography>📶 ISP: {userIpData.isp}</Typography>
            <Typography>💻 Hostname: {userIpData.hostname}</Typography>
            <Typography>🔑 IP Type: {userIpData.type}</Typography>
          </div>
        )}

        {speedValue !== null && (
          <div
            className={`mt-6 p-4 rounded-lg shadow-xl text-white ${bannerColor}`}
          >
            <Typography variant="h5">🚀 Internet Speed</Typography>
            <Typography className="text-lg">{speedDisplay}</Typography>
          </div>
        )}

        {portStatus && (
          <div className="mt-4 p-4 bg-gray-200 rounded-lg shadow-md">
            <Typography variant="h6">{portStatus}</Typography>
          </div>
        )}
      </Card>
    </div>
  );
}
