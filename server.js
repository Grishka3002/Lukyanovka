const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = process.env.PORT || 8080;
const contentFilePath = path.join(root, "data", "content.json");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
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

const readContentFile = () =>
  new Promise((resolve, reject) => {
    fs.readFile(contentFilePath, "utf8", (error, content) => {
      if (error) {
        reject(error);
        return;
      }

      try {
        resolve(JSON.parse(content));
      } catch (parseError) {
        reject(parseError);
      }
    });
  });

const writeContentFile = (content) =>
  new Promise((resolve, reject) => {
    fs.mkdir(path.dirname(contentFilePath), { recursive: true }, (mkdirError) => {
      if (mkdirError) {
        reject(mkdirError);
        return;
      }

      fs.writeFile(contentFilePath, `${JSON.stringify(content, null, 2)}\n`, "utf8", (writeError) => {
        if (writeError) {
          reject(writeError);
          return;
        }

        resolve();
      });
    });
  });

const getAdminPasswordFromRequest = (request) => {
  const bearer = request.headers.authorization || "";
  if (bearer.toLowerCase().startsWith("bearer ")) {
    return bearer.slice(7);
  }

  return request.headers["x-admin-password"];
};

const authorizeAdmin = (request, response) => {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    sendJson(response, 503, { ok: false, error: "ADMIN_PASSWORD is not configured" });
    return false;
  }

  if (getAdminPasswordFromRequest(request) !== adminPassword) {
    sendJson(response, 401, { ok: false, error: "Invalid admin password" });
    return false;
  }

  return true;
};

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

    const payload = JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" });
    const telegramRequest = https.request(
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

    telegramRequest.on("error", reject);
    telegramRequest.write(payload);
    telegramRequest.end();
  });

const handleContentRoutes = (request, response, routePath) => {
  if (request.method === "GET" && routePath === "/api/content") {
    readContentFile()
      .then((content) => sendJson(response, 200, { ok: true, content }))
      .catch((error) => {
        console.error(error);
        sendJson(response, 500, { ok: false, error: "Content is unavailable" });
      });
    return true;
  }

  if (request.method === "GET" && routePath === "/api/admin/content") {
    if (!authorizeAdmin(request, response)) return true;

    readContentFile()
      .then((content) => sendJson(response, 200, { ok: true, content, updatedAt: new Date().toISOString() }))
      .catch((error) => {
        console.error(error);
        sendJson(response, 500, { ok: false, error: "Content is unavailable" });
      });
    return true;
  }

  if (request.method === "POST" && routePath === "/api/admin/content") {
    if (!authorizeAdmin(request, response)) return true;

    readJsonBody(request)
      .then(async (payload) => {
        if (!payload || typeof payload.content !== "object" || Array.isArray(payload.content)) {
          sendJson(response, 400, { ok: false, error: "Invalid content payload" });
          return;
        }

        await writeContentFile(payload.content);
        sendJson(response, 200, { ok: true, savedAt: new Date().toISOString() });
      })
      .catch((error) => {
        console.error(error);
        sendJson(response, 500, { ok: false, error: "Could not save content" });
      });
    return true;
  }

  return false;
};

const handleBookingRoute = (request, response, routePath) => {
  if (request.method !== "POST" || routePath !== "/api/booking") return false;

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

  return true;
};

const server = http.createServer((request, response) => {
  const routePath = request.url.split("?")[0];
  if (handleContentRoutes(request, response, routePath)) return;
  if (handleBookingRoute(request, response, routePath)) return;

  const urlPath = decodeURIComponent(routePath);
  const pageRoutes = {
    "/": "/index.html",
    "/rooms": "/rooms.html",
    "/host": "/host.html",
    "/location": "/location.html",
    "/booking": "/booking.html",
    "/admin": "/admin.html",
  };
  const requestedPath = pageRoutes[urlPath] || urlPath;
  const safePath = path
    .normalize(requestedPath)
    .replace(/^(\.\.[/\\])+/, "")
    .replace(/^[/\\]+/, "");
  const filePath = path.join(root, safePath);

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
    response.writeHead(200, { "Content-Type": contentTypes[extension] || "application/octet-stream" });
    response.end(content);
  });
});

server.listen(port, () => {
  console.log(`Maori Lukyanovka site is running on port ${port}`);
});
