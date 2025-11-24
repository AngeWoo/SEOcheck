// server.js

// 1. 引入需要的套件
const express = require('express');
const axios = require('axios');
const cors = require('cors');

// 2. 建立 Express 應用程式
const app = express();
const PORT = 3000; // 您可以自訂埠號，例如 3000 或 8080

// 3. 使用 CORS 中介軟體
// 這允許任何來源的請求，對於本機開發很方便
app.use(cors());

// 4. 建立一個 GET 路由來處理代理請求
// 我們將路由設定為 /proxy，並透過查詢參數 'url' 來接收目標網址
app.get('/proxy', async (req, res) => {
  // 從請求的查詢參數中獲取 'url'
  const targetUrl = req.query.url;

  // 檢查是否有提供 url
  if (!targetUrl) {
    return res.status(400).send({ error: '缺少目標網址 (url) 查詢參數' });
  }

  try {
    // 5. 使用 axios 向目標網址發送 GET 請求
    const response = await axios.get(targetUrl, {
      // 模擬瀏覽器行為，避免被某些網站阻擋
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      // 增加超時設定 (例如 10 秒)
      timeout: 10000 
    });

    // 6. 將從目標網站獲取的 HTML 內容回傳給前端
    res.send(response.data);

  } catch (error) {
    // 7. 如果抓取失敗，回傳更詳細的錯誤訊息
    console.error(`抓取 ${targetUrl} 時發生錯誤:`, error.message);
    
    // 判斷錯誤類型並回傳對應的狀態碼
    if (error.response) {
      // 請求已發出，但伺服器用非 2xx 的狀態碼回應
      res.status(error.response.status).send({ 
        error: `遠端伺服器回應錯誤`, 
        details: `Status ${error.response.status}: ${error.response.statusText}`
      });
    } else if (error.request) {
      // 請求已發出，但沒有收到回應
      res.status(504).send({ error: '無法從遠端伺服器獲取回應 (Gateway Timeout)' });
    } else {
      // 設定請求時發生了問題
      res.status(500).send({ error: '建立請求時發生未知錯誤', details: error.message });
    }
  }
});

// === 新增的程式碼 Start ===
// 建立一個 GET 路由來檢查伺服器狀態
app.get('/status', (req, res) => {
  // 回傳一個 JSON 物件表示伺服器正在運行
  res.json({ status: 'ok', message: 'Proxy server is running.' });
});
// === 新增的程式碼 End ===

// 8. 啟動伺服器並監聽指定的埠號
app.listen(PORT, () => {
  console.log(`✅ 代理伺服器已啟動，正在監聽 http://localhost:${PORT}`);
});