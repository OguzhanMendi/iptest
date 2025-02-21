export default async function handler(req, res) {
  try {
    // Kullanıcının IP adresini al
    const userIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // IPInfo API'sini çağır
    const response = await fetch(
      `https://ipinfo.io/${userIP}?token=faac19cdc35949`
    );
    const data = await response.json();

    res.status(200).json({
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country,
      isp: data.org,
      hostname: data.hostname || "Bilinmiyor",
      type: data.bogon ? "Geçersiz IP" : "Potansiyel Dinamik IP",
    });
  } catch (error) {
    res.status(500).json({ error: "IP bilgisi alınamadı." });
  }
}
