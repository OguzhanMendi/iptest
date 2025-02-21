import { useEffect, useState } from "react";

export default function IpInfoPage() {
  const [ipData, setIpData] = useState(null);

  useEffect(() => {
    fetch("/api/check-ip")
      .then((res) => res.json())
      .then((data) => setIpData(data))
      .catch((err) => console.error("IP bilgisi alınamadı:", err));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">IP Adresi Bilgileri</h1>

      {ipData ? (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>
            <strong>IP:</strong> {ipData.ip}
          </p>
          <p>
            <strong>Şehir:</strong> {ipData.city}
          </p>
          <p>
            <strong>Bölge:</strong> {ipData.region}
          </p>
          <p>
            <strong>Ülke:</strong> {ipData.country}
          </p>
          <p>
            <strong>ISP:</strong> {ipData.isp}
          </p>
          <p>
            <strong>Hostname:</strong> {ipData.hostname}
          </p>
          <p>
            <strong>IP Türü:</strong> {ipData.type}
          </p>
        </div>
      ) : (
        <p>IP bilgileri yükleniyor...</p>
      )}
    </div>
  );
}
