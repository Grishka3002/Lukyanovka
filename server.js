const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = process.env.PORT || 8080;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const sendJson = (response, status, payload) => {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
};

const readJsonBody = (request) =>
  new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Payload too large"));
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error("Invalid JSON"));
      }
    });
    request.on("error", reject);
  });

const escapeTelegram = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const buildBookingMessage = (data) => {
  const lines = [
    "<b>Новая заявка Маори</b>",
    "",
    `<b>Имя:</b> ${escapeTelegram(data.name)}`,
    `<b>Телефон:</b> ${escapeTelegram(data.phone)}`,
    `<b>Ответить:</b> ${escapeTelegram(data.messenger || "не указано")}`,
    `<b>Заезд:</b> ${escapeTelegram(data.checkin)}`,
    `<b>Выезд:</b> ${escapeTelegram(data.checkout)}`,
    `<b>Гости:</b> ${escapeTelegram(data.guests)}`,
    `<b>Комната:</b> ${escapeTelegram(data.house)}`,
  ];

  if (data.message) {
    lines.push("", `<b>Комментарий:</b> ${escapeTelegram(data.message)}`);
  }

  return lines.join("\n");
};

const sendTelegramMessage = (text) =>
  new Promise((resolve, reject) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      resolve({ delivered: false, reason: "Telegram is not configured" });
      return;
    }

    const payload = JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    });

    const request = https.request(
      {
        hostname: "api.telegram.org",
        path: `/bot${token}/sendMessage`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (telegramResponse) => {
        let responseBody = "";
        telegramResponse.on("data", (chunk) => {
          responseBody += chunk;
        });
        telegramResponse.on("end", () => {
          if (telegramResponse.statusCode >= 200 && telegramResponse.statusCode < 300) {
            resolve({ delivered: true });
            return;
          }

          reject(new Error(`Telegram responded with ${telegramResponse.statusCode}: ${responseBody}`));
        });
      }
    );

    request.on("error", reject);
    request.write(payload);
    request.end();
  });

const server = http.createServer((request, response) => {
  if (request.method === "POST" && request.url.split("?")[0] === "/api/booking") {
    readJsonBody(request)
      .then(async (data) => {
        const requiredFields = ["name", "phone", "checkin", "checkout", "guests", "house", "consent"];
        const missingField = requiredFields.find((field) => !data[field]);

        if (missingField) {
          sendJson(response, 400, { ok: false, error: "Заполните обязательные поля" });
          return;
        }

        const telegramResult = await sendTelegramMessage(buildBookingMessage(data));
        sendJson(response, 200, { ok: true, ...telegramResult });
      })
      .catch((error) => {
        console.error(error);
        sendJson(response, 500, { ok: false, error: "Не удалось обработать заявку" });
      });
    return;
  }

  const urlPath = decodeURIComponent(request.url.split("?")[0]);
  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  const pageRoutes = {
    "/": "/index.html",
    "/rooms": "/rooms.html",
    "/host": "/host.html",
    "/location": "/location.html",
    "/booking": "/booking.html",
  };
  const requestedPath = pageRoutes[safePath] || safePath;
  const filePath = path.join(root, requestedPath);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      fs.readFile(path.join(root, "index.html"), (fallbackError, fallback) => {
        if (fallbackError) {
          response.writeHead(404);
          response.end("Not found");
          return;
        }

        response.writeHead(200, { "Content-Type": contentTypes[".html"] });
        response.end(fallback);
      });
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": contentTypes[extension] || "application/octet-stream",
    });
    response.end(content);
  });
});

server.listen(port, () => {
  console.log(`Maori Lukyanovka site is running on port ${port}`);
});
