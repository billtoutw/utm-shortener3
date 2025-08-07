import React, { useState } from 'react';
import { Copy, Link, ExternalLink, Check } from 'lucide-react';

const serviceOptions = [
  { value: 'bitly', label: 'Bitly', apiDoc: 'https://app.bitly.com/settings/api' },
  { value: 'tinyurl', label: 'TinyURL', apiDoc: 'https://tinyurl.com/app/settings/api' },
  { value: 'picsee', label: 'PicSee', apiDoc: 'https://picsee.io/developers' },
];

const UTMShortenerApp = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [campaignSource, setCampaignSource] = useState('');
  const [campaignMedium, setCampaignMedium] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [utmUrl, setUtmUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedUtm, setCopiedUtm] = useState(false);
  const [copiedShort, setCopiedShort] = useState(false);
  const [error, setError] = useState('');
  const [service, setService] = useState('bitly'); // 預設 bitly

  // 選單內容
  const sourceOptions = ['FB', 'IGBIO', 'IGSTORY', 'THREAD', 'LINE'];
  const mediumOptions = ['TNL', 'SV', 'INSIDE'];

  const generateUTMUrl = () => {
    if (!originalUrl || !campaignSource || !campaignMedium || !apiKey) {
      setError('請填寫完整資訊（包括 API Key）');
      return;
    }
    try {
      const url = new URL(originalUrl);
      const params = new URLSearchParams();
      params.append('utm_source', campaignSource);
      params.append('utm_medium', campaignMedium);

      // 加 UTM 參數
      const existingParams = url.search;
      if (existingParams) {
        url.search = existingParams + '&' + params.toString();
      } else {
        url.search = '?' + params.toString();
      }
      const generatedUtmUrl = url.toString();
      setUtmUrl(generatedUtmUrl);
      setError('');
      shortenUrl(generatedUtmUrl, service);
    } catch (error) {
      setError('請輸入有效的網址格式（例如 https://example.com）');
    }
  };

  const shortenUrl = async (urlToShorten, service) => {
    setIsGenerating(true);
    setShortUrl('');
    setError('');
    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToShorten, apiKey, service }),
      });
      const data = await response.json();
      if (response.ok && data.shortUrl) {
        setShortUrl(data.shortUrl);
      } else {
        setError('縮網址失敗：' + (data.error || '未知錯誤'));
      }
    } catch (error) {
      setError('無法連接到伺服器，請檢查 API Key 或網路連線');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'utm') {
        setCopiedUtm(true);
        setTimeout(() => setCopiedUtm(false), 2000);
      } else {
        setCopiedShort(true);
        setTimeout(() => setCopiedShort(false), 2000);
      }
    } catch (error) {
      // 備用複製方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      if (type === 'utm') {
        setCopiedUtm(true);
        setTimeout(() => setCopiedUtm(false), 2000);
      } else {
        setCopiedShort(true);
        setTimeout(() => setCopiedShort(false), 2000);
      }
    }
  };

  const resetForm = () => {
    setOriginalUrl('');
    setCampaignSource('');
    setCampaignMedium('');
    setApiKey('');
    setUtmUrl('');
    setShortUrl('');
    setCopiedUtm(false);
    setCopiedShort(false);
    setError('');
    setService('bitly');
  };

  // 動態取得 API Key 說明網址
  const currentService = serviceOptions.find((s) => s.value === service);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Link className="w-8 h-8 text-indigo-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-800">UTM 追蹤碼 + 縮網址工具</h1>
            </div>
            <p className="text-gray-600">一鍵完成網址埋碼和縮短，提升您的工作效率</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 左側：輸入區域 */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  選擇縮網址服務 *
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  {serviceOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {currentService.label} API Key *
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder={`輸入您的 ${currentService.label} API Key`}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                需申請{' '}
                <a
                  href={currentService.apiDoc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  {currentService.label} API Key
                </a>
                {' '}後才可自動縮短
              </p>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  原始網址 *
                </label>
                <input
                  type="url"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  發布平台 (Campaign Source) *
                </label>
                <select
                  value={campaignSource}
                  onChange={(e) => setCampaignSource(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">選擇發布平台</option>
                  {sourceOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  品牌名稱 (Campaign Medium) *
                </label>
                <select
                  value={campaignMedium}
                  onChange={(e) => setCampaignMedium(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">選擇品牌名稱</option>
                  {mediumOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={generateUTMUrl}
                  disabled={isGenerating}
                  className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? '處理中...' : '生成追蹤網址'}
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  重置
                </button>
              </div>
              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </div>

            {/* 右側：結果區域 */}
            <div className="space-y-6">
              {utmUrl && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    UTM 追蹤網址
                  </label>
                  <div className="relative">
                    <textarea
                      value={utmUrl}
                      readOnly
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm resize-none"
                    />
                    <button
                      onClick={() => copyToClipboard(utmUrl, 'utm')}
                      className="absolute top-2 right-2 p-2 text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                      {copiedUtm ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {shortUrl && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    縮短網址
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={shortUrl}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <button
                        onClick={() => copyToClipboard(shortUrl, 'short')}
                        className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
                      >
                        {copiedShort ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <a
                        href={shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {utmUrl && !shortUrl && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">手動縮短網址</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    如果自動縮短失敗，請手動完成最後一步：
                  </p>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside mb-3">
                    <li>複製上方的 UTM 追蹤網址</li>
                    <li>
                      前往{' '}
                      <a
                        href={
                          service === 'bitly'
                            ? 'https://bitly.com/'
                            : service === 'picsee'
                            ? 'https://picsee.io/'
                            : 'https://tinyurl.com/'
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold underline"
                      >
                        {service === 'bitly'
                          ? 'bitly.com'
                          : service === 'picsee'
                          ? 'picsee.io'
                          : 'tinyurl.com'}
                      </a>
                    </li>
                    <li>貼上網址並點擊縮短</li>
                    <li>複製生成的短網址使用</li>
                  </ol>
                  <a
                    href={
                      service === 'bitly'
                        ? 'https://bitly.com/'
                        : service === 'picsee'
                        ? 'https://picsee.io/'
                        : 'https://tinyurl.com/'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    前往
                    {service === 'bitly'
                      ? ' Bitly'
                      : service === 'picsee'
                      ? ' PicSee'
                      : ' TinyURL'}
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>
              )}

              {!utmUrl && !shortUrl && (
                <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center text-gray-500">
                    <Link className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>填寫左側表單後，結果會顯示在這裡</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 使用說明 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">使用說明</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">技術說明：</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>由於瀏覽器 CORS 安全限制，需透過後端代理調用 Bitly、TinyURL 或 PicSee API</li>
                <li>工具會自動生成 UTM 追蹤網址</li>
                <li>若自動縮短失敗，需手動完成最後的縮網址步驟</li>
                <li>建議使用 bitly.com、tinyurl.com、picsee.io 或其他縮網址服務</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">使用流程：</h3>
              <ol className="space-y-1 list-decimal list-inside">
                <li>選擇縮網址服務</li>
                <li>輸入您的 API Key（依服務選擇 Bitly、TinyURL 或 PicSee）</li>
                <li>填入您要追蹤的原始網址</li>
                <li>選擇發布平台（FB、IGBIO、IGSTORY 等）</li>
                <li>選擇品牌名稱（TNL、SV、INSIDE）</li>
                <li>點擊「生成追蹤網址」取得 UTM 網址</li>
                <li>自動生成短網址或手動縮短</li>
                <li>使用最終的短網址</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">功能特色：</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>同時支援 Bitly、TinyURL、PicSee 自動縮短</li>
                <li>自動生成 UTM 追蹤網址</li>
                <li>預設常用的平台和品牌選項</li>
                <li>一鍵複製功能</li>
                <li>即時預覽 UTM 參數</li>
                <li>支援網址有效性驗證</li>
                <li>響應式設計，手機也能使用</li>
                <li>簡化工作流程</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UTMShortenerApp;
