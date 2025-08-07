export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: '僅支援 POST 方法' });

  const { url, apiKey, service } = req.body || {};
  if (!url || !apiKey || !service) {
    return res.status(400).json({ error: '請提供 URL、API Key 與服務種類' });
  }

  try {
    let response, data;
    if (service === 'bitly') {
      response = await fetch('https://api-ssl.bitly.com/v4/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ long_url: url }),
      });
      data = await response.json();
      if (response.ok && data.link) {
        return res.status(200).json({ shortUrl: data.link });
      } else {
        return res.status(400).json({ error: data.message || 'Bitly API 錯誤' });
      }
    } else if (service === 'tinyurl') {
      response = await fetch('https://api.tinyurl.com/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          domain: 'tinyurl.com',
        }),
      });
      data = await response.json();
      if (response.ok && data.data && data.data.tiny_url) {
        return res.status(200).json({ shortUrl: data.data.tiny_url });
      } else {
        return res.status(400).json({ error: (data.errors && data.errors[0]?.message) || 'TinyURL API 錯誤' });
      }
    } else if (service === 'picsee') {
      // 注意 access_token 是 query string 帶入
      response = await fetch('https://api.pics.ee/v1/links?access_token=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: url })
      });
      data = await response.json();
      if (response.ok && data.short_url) {
        return res.status(200).json({ shortUrl: data.short_url });
      } else {
        return res.status(400).json({ error: (data.message || (data.errors && data.errors[0]?.message) || 'PicSee API 錯誤') });
      }
    } else {
      return res.status(400).json({ error: '不支援的縮網址服務' });
    }
  } catch (err) {
    return res.status(500).json({ error: `伺服器錯誤: ${err.message}` });
  }
}
