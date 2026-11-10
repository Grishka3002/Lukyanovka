const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { EventEmitter } = require("node:events");
const root = path.join(__dirname, "..");
let handle;
const realRequire = require("node:module").createRequire(path.join(root, "server.js"));
vm.runInNewContext(fs.readFileSync(path.join(root, "server.js"), "utf8"), {
  __dirname: root,
  process: { env: {} },
  console: { log() {}, error() {} },
  Buffer,
  require(name) {
    if (name === "http") return { createServer(handler) { handle = handler; return { listen() {} }; } };
    if (name === "https") return { request() { throw new Error("Tests must never contact Telegram"); } };
    return realRequire(name);
  }
});
const request = (method, url, data) => new Promise((resolve) => {
  const req = new EventEmitter();
  Object.assign(req, { method, url, headers: {}, destroy() {} });
  const res = {
    writeHead(status, headers) { this.status = status; this.headers = headers; },
    end(body) { resolve({ status: this.status, headers: this.headers, body: String(body) }); }
  };
  handle(req, res);
  queueMicrotask(() => {
    if (data !== undefined) req.emit("data", JSON.stringify(data));
    req.emit("end");
  });
});
test("content endpoint returns editable data", async () => {
  const response = await request("GET", "/api/content");
  assert.equal(response.status, 200);
  assert.equal(JSON.parse(response.body).content.home.about.title, "Один дом. Пять комнат.");
});
test("booking endpoint accepts optional fields without claiming delivery", async () => {
  const response = await request("POST", "/api/booking", {
    phone: "+7 914 000-00-00", checkin: "2099-12-10", checkout: "2099-12-12", guests: "2 гостя", consent: "yes"
  });
  assert.equal(response.status, 200);
  assert.equal(JSON.parse(response.body).delivered, false);
});
test("booking endpoint rejects malformed and impossible requests", async () => {
  for (const payload of [null, [], { consent: "no" }, {
    phone: "+79140000000", checkin: "2099-02-30", checkout: "2099-03-02", guests: "2 гостя", consent: "yes"
  }]) assert.equal((await request("POST", "/api/booking", payload)).status, 400);
});
test("admin content still requires configured authentication", async () => {
  assert.equal((await request("GET", "/api/admin/content")).status, 503);
});
test("all pages load bundled content before the application script", async () => {
  for (const page of ["/", "/rooms", "/host", "/location", "/booking"]) {
    const response = await request("GET", page);
    assert.equal(response.status, 200);
    assert.ok(response.body.indexOf('src="content-defaults.js"') < response.body.indexOf('src="script.js"'));
    assert.ok(response.body.includes('src="content-defaults.js"'));
  }
  const response = await request("GET", "/content-defaults.js");
  const sandbox = { window: {} };
  vm.runInNewContext(response.body, sandbox);
  assert.equal(JSON.stringify(sandbox.window.MAORI_DEFAULT_CONTENT), JSON.stringify(JSON.parse(fs.readFileSync(path.join(root, "data/content.json"), "utf8"))));
});

test("unknown resources return genuine 404 responses", async () => {
  for (const url of ["/missing-page", "/missing.png", "/api/missing"]) {
    const response = await request("GET", url);
    assert.equal(response.status, 404);
    assert.equal(response.headers["X-Robots-Tag"], "noindex");
  }
});
test("legacy HTML links redirect to canonical routes and preserve selection", async () => {
  const response = await request("GET", "/booking.html?room=example");
  assert.equal(response.status, 301);
  assert.equal(response.headers.Location, "/booking?room=example");
  assert.equal((await request("GET", "/index.html")).headers.Location, "/");
});
test("crawler files have correct formats and canonical page lists", async () => {
  const robots = await request("GET", "/robots.txt");
  assert.equal(robots.status, 200);
  assert.match(robots.headers["Content-Type"], /text\/plain/);
  assert.match(robots.body, /Sitemap:/);
  const sitemap = await request("GET", "/sitemap.xml");
  assert.equal(sitemap.status, 200);
  assert.match(sitemap.headers["Content-Type"], /application\/xml/);
  assert.equal((sitemap.body.match(/<loc>/g) || []).length, 5);
});
test("pages have distinct titles and self-referencing canonical links", async () => {
  const titles = new Set();
  for (const url of ["/", "/rooms", "/host", "/location", "/booking"]) {
    const response = await request("GET", url);
    const title = response.body.match(/<title>(.*?)<\/title>/)[1];
    assert.ok(!titles.has(title));
    titles.add(title);
    assert.ok(response.body.includes(`rel="canonical" href="https://lukyanovka-production-f80a.up.railway.app${url}"`));
  }
});
