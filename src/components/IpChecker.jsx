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

// Sunucu tarafı veri getirme
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
    console.error("IP verisi alınamadı:", error);
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

  // IP, Hız ve Port Kontrolü
  const handleCheckAll = async () => {
    if (!ip) {
      setError("Lütfen bir IP adresi girin.");
      return;
    }
    setError("");
    setLoading(true);
    setPortStatus("");

    try {
      // IP Kontrolü
      const ipResponse = await fetch(
        `https://ipinfo.io/${ip}?token=faac19cdc35949`
      );
      const ipData = await ipResponse.json();

      if (ipData.error) {
        setError("Geçersiz IP adresi.");
        setUserIpData(null);
      } else {
        setUserIpData({
          ip: ipData.ip,
          city: ipData.city,
          region: ipData.region,
          country: ipData.country,
          isp: ipData.org,
          hostname: ipData.hostname || "Bilinmiyor",
          type: ipData.bogon ? "Geçersiz IP" : "Potansiyel Dinamik IP",
        });
      }

      // İnternet Hız Testi
      await checkInternetSpeed();

      // Port Kontrolü
      if (port) {
        await checkPort(ip, port);
      }
    } catch (err) {
      setError("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // İnternet Hızını Test Et
  const checkInternetSpeed = async () => {
    setSpeedDisplay("Ölçülüyor...");
    const startTime = Date.now();

    try {
      const response = await fetch(
        "https://speed.cloudflare.com/__down?bytes=10000000"
      );
      if (!response.ok) throw new Error("Hız testi başarısız");

      const duration = (Date.now() - startTime) / 1000;
      const speedMbps = (10 / duration) * 8; // Mbps

      setSpeedValue(speedMbps);
      setSpeedDisplay(speedMbps.toFixed(2) + " Mbps");

      // Banner Rengini Belirle
      if (speedMbps < 20) {
        setBannerColor("bg-red-500");
      } else if (speedMbps > 75) {
        setBannerColor("bg-green-500");
      } else {
        setBannerColor("bg-yellow-500");
      }
    } catch (error) {
      setSpeedDisplay("Ölçülemedi");
      setBannerColor("bg-gray-500");
    }
  };

  const checkPort = async (ip, port) => {
    try {
      const response = await axios.post("https://portchecker.io/api/query", {
        ip: ip,
        port: port,
      });

      const result = response.data;
      if (result.open) {
        setPortStatus(`✅ ${port} portu açık!`);
      } else {
        setPortStatus(`❌ ${port} portu kapalı!`);
      }
    } catch (error) {
      setPortStatus("⚠️ Port kontrolü yapılamadı.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-300 to-blue-500">
      {/* RMOS Yazılım Reklam Banner'ı - Hareketli ve Renkli */}
      <div className="w-full p-4 text-center text-white font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-pulse">
        <Typography variant="h6">
          💡 Siz neden hala RMOS POS Sistemi'ne geçmeyi düşünmüyorsunuz? 💻
        </Typography>
      </div>

      <Card className="p-4 w-1/4 shadow-2xl bg-white rounded-lg mt-4">
        <Typography variant="h5" className="text-center font-bold mb-4">
          🌍 <span className="text-blue-600">IP Kontrol ve Hız Testi</span>
        </Typography>

        <div className="flex gap-2 mb-2 justify-center items-center">
          <TextField
            fullWidth
            label="IP adresini girin"
            variant="outlined"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
          />
          <TextField
            fullWidth
            label="Port numarasını girin"
            variant="outlined"
            value={port}
            onChange={(e) => setPort(e.target.value)}
          />
          <Button
            variant="contained"
            color="error"
            onClick={handleCheckAll}
            disabled={loading}
            className="flex items-center justify-center"
            size="large" // Buton boyutunu büyük yapar
          >
            🚀 TEST
          </Button>
        </div>

        {error && <Alert severity="error">{error}</Alert>}
        {loading && <CircularProgress className="mx-auto my-4" />}

        {userIpData && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-lg">
            <Typography variant="h6">🌐 IP Bilgileri</Typography>
            <Typography>📡 IP: {userIpData.ip}</Typography>
            <Typography>🌆 Şehir: {userIpData.city}</Typography>
            <Typography>📍 Bölge: {userIpData.region}</Typography>
            <Typography>🌍 Ülke: {userIpData.country}</Typography>
            <Typography>📶 ISP: {userIpData.isp}</Typography>
            <Typography>💻 Hostname: {userIpData.hostname}</Typography>
            <Typography>🔑 IP Türü: {userIpData.type}</Typography>
          </div>
        )}

        {speedValue !== null && (
          <div
            className={`mt-6 p-4 rounded-lg shadow-xl text-white ${bannerColor}`}
          >
            <Typography variant="h5">🚀 İnternet Hızınız</Typography>
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
