// 全球部署延遲測試：部署到 Render 的小型伺服器（不需安裝任何套件）
// 每個區域部署同一份程式，只在 Render 的環境變數 REGION 填不同名稱
const http = require("http");
const fs = require("fs");
const path = require("path");

const REGION = process.env.REGION || "unknown";
const PORT = process.env.PORT || 10000;
const TEST_FILE = fs.readFileSync(path.join(__dirname, "test.bin")); // 1 MB 測試檔

// no-store：禁止任何 CDN / 代理快取，確保每次都真的跑到這個區域
const baseHeaders = {
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
};

http
  .createServer((req, res) => {
    if (req.url.startsWith("/ping")) {
      res.writeHead(200, { ...baseHeaders, "Content-Type": "application/json" });
      res.end(JSON.stringify({ region: REGION, serverTime: Date.now() }));
      return;
    }
    if (req.url.startsWith("/test.bin")) {
      res.writeHead(200, {
        ...baseHeaders,
        "Content-Type": "application/octet-stream",
        "Content-Length": TEST_FILE.length,
      });
      res.end(TEST_FILE);
      return;
    }
    res.writeHead(200, { ...baseHeaders, "Content-Type": "text/html; charset=utf-8" });
    res.end(
      `<!doctype html><meta charset="utf-8"><title>${REGION}</title>` +
        `<h1>Hello from ${REGION}</h1><p>試試 <a href="/ping">/ping</a> 或 <a href="/test.bin">/test.bin</a></p>`
    );
  })
  .listen(PORT, () => console.log(`Server (${REGION}) listening on ${PORT}`));
