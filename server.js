const http = require("http");
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

const server = http.createServer((request, response) => {
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
