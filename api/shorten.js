export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '僅支援 POST 方法' });
  }

  const { url, apiKey } = req.body;

  if (!url || !apiKey) {
    return res.status(400).json({ error: '請提供 URL 和 API Key' });
  }

  try {
    const response = await fetch('https://api-ssl.bitly.com/v4/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ long_url: url }),
    });

    const data = await response.json();
    if (response.ok && data.link) {
      return res.status(200).json({ shortUrl: data.link });
    } else {
      return res.status(400).json({ error: data.message || 'Bitly API 錯誤' });
    }
  } catch (err) {
    return res.status(500).json({ error: `伺服器錯誤: ${err.message}` });
  }
}