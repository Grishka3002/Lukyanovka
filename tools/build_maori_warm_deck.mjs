import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const [repoRoot, scratchRoot, outputPath] = process.argv.slice(2);

if (!repoRoot || !scratchRoot || !outputPath) {
  throw new Error("Usage: node build_maori_warm_deck.mjs <repo-root> <scratch-root> <output-pptx>");
}

const W = 1280;
const H = 720;
const NONE = "#00000000";
const SERIF = "Georgia";
const SANS = "Arial";
const SCRIPT = "Segoe Print";

const asset = (name) => path.join(repoRoot, "assets", name);
const assets = {
  wood: asset("warm-wood-texture.png"),
  house: asset("warm-house-exterior.png"),
  host: asset("warm-host-kitchen.png"),
  room: asset("warm-room.png"),
  table: asset("warm-table.png"),
};

const imageCache = new Map();

async function imageBytes(imagePath) {
  if (!imageCache.has(imagePath)) {
    const bytes = await fs.readFile(imagePath);
    imageCache.set(
      imagePath,
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    );
  }
  return imageCache.get(imagePath);
}

function rect(slide, left, top, width, height, fill, options = {}) {
  return slide.shapes.add({
    geometry: options.geometry ?? "rect",
    name: options.name,
    position: { left, top, width, height },
    fill,
    line: options.line ?? { style: "solid", fill: NONE, width: 0 },
    borderRadius: options.borderRadius,
  });
}

function line(slide, left, top, width, height, color, weight = 1) {
  return slide.shapes.add({
    geometry: "line",
    position: { left, top, width, height },
    fill: NONE,
    line: { style: "solid", fill: color, width: weight },
  });
}

function textBox(slide, text, left, top, width, height, options = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position: { left, top, width, height },
    fill: options.fill ?? NONE,
    line: options.line ?? { style: "solid", fill: NONE, width: 0 },
    borderRadius: options.borderRadius,
  });
  shape.text = text;
  shape.text.fontSize = options.fontSize ?? 22;
  shape.text.color = options.color ?? "#2C2923";
  shape.text.bold = Boolean(options.bold);
  shape.text.typeface = options.font ?? SANS;
  shape.text.alignment = options.align ?? "left";
  shape.text.verticalAlignment = options.valign ?? "top";
  shape.text.insets = options.insets ?? { left: 0, right: 0, top: 0, bottom: 0 };
  return shape;
}

async function image(slide, imagePath, left, top, width, height, options = {}) {
  return slide.images.add({
    blob: await imageBytes(imagePath),
    contentType: "image/png",
    alt: options.alt ?? "Фотореференс для дизайн-концепции Маори Лукьяновка",
    fit: options.fit ?? "cover",
    crop: options.crop,
    geometry: options.geometry ?? "rect",
    borderRadius: options.borderRadius,
    position: { left, top, width, height },
  });
}

function slideNo(slide, number, color) {
  textBox(slide, String(number).padStart(2, "0"), 1200, 678, 40, 20, {
    fontSize: 16,
    color,
    align: "right",
  });
}

function conceptStamp(slide, number, title, fill, color) {
  rect(slide, 28, 90, 374, 34, fill, {
    line: { style: "solid", fill: color, width: 1 },
  });
  line(slide, 82, 90, 0, 34, color, 1);
  textBox(slide, number, 28, 97, 54, 20, {
    fontSize: 16,
    bold: true,
    color,
    align: "center",
  });
  textBox(slide, title, 96, 97, 288, 22, {
    fontSize: 16,
    bold: true,
    color,
  });
}

function button(slide, label, left, top, width, fill, color, lineColor = fill) {
  rect(slide, left, top, width, 48, fill, {
    line: { style: "solid", fill: lineColor, width: 1 },
    borderRadius: 4,
  });
  textBox(slide, label, left, top + 14, width, 22, {
    fontSize: 16,
    bold: true,
    color,
    align: "center",
  });
}

function nav(slide, options = {}) {
  const {
    top = 0,
    fill = "#F6EBDD",
    color = "#2D211A",
    accent = "#C8863F",
    border = "#00000000",
    dark = false,
  } = options;
  rect(slide, 0, top, W, 72, fill, {
    line: { style: "solid", fill: border, width: 1 },
  });
  textBox(slide, "МАОРИ", 54, top + 20, 150, 28, {
    fontSize: 23,
    bold: true,
    font: SERIF,
    color,
  });
  textBox(slide, "Дом     Комнаты     Катерина     Отдых", 416, top + 25, 462, 22, {
    fontSize: 16,
    color,
    align: "center",
  });
  rect(slide, 1040, top + 17, 184, 38, dark ? accent : color, { borderRadius: 4 });
  textBox(slide, "СВЯЗАТЬСЯ", 1040, top + 28, 184, 18, {
    fontSize: 16,
    bold: true,
    color: dark ? "#21140E" : "#FFF9F1",
    align: "center",
  });
}

function swatches(slide, colors, left, top, labelColor) {
  colors.forEach((color, index) => {
    rect(slide, left + index * 80, top, 64, 34, color, {
      line: { style: "solid", fill: labelColor, width: 1 },
    });
    textBox(slide, color.toUpperCase(), left + index * 80 - 3, top + 42, 70, 18, {
      fontSize: 16,
      color: labelColor,
      align: "center",
    });
  });
}

async function writeBlob(filePath, blob) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

const deck = Presentation.create({ slideSize: { width: W, height: H } });

// 1. Cover
{
  const slide = deck.slides.add();
  slide.background.fill = "#2D211A";
  await image(slide, assets.wood, 0, 0, W, H, {
    alt: "Теплая фактура темного ореха",
  });
  rect(slide, 0, 0, W, H, "#21160F99");
  rect(slide, 612, 0, 668, H, "#1B120D66");
  await image(slide, assets.house, 650, 70, 562, 522, {
    alt: "Один деревянный гостевой дом в горах Приморья",
    crop: { left: 0.23, top: 0.03, right: 0.02, bottom: 0.03 },
  });
  rect(slide, 650, 70, 562, 522, NONE, {
    line: { style: "solid", fill: "#F2D7B1", width: 2 },
  });
  textBox(slide, "МАОРИ ЛУКЬЯНОВКА", 68, 62, 430, 26, {
    fontSize: 18,
    bold: true,
    color: "#F2D7B1",
  });
  textBox(slide, "Теплый дом\nкак визуальный язык", 68, 132, 512, 154, {
    fontSize: 50,
    bold: true,
    font: SERIF,
    color: "#FFF8EE",
  });
  textBox(slide, "Дерево, свет и чувство,\nчто тебя уже ждут", 72, 328, 420, 74, {
    fontSize: 27,
    font: SCRIPT,
    color: "#E7C49B",
  });
  line(slide, 72, 438, 88, 0, "#C8863F", 4);
  textBox(slide, "4 дизайн-направления\nпо 2 страницы в каждом", 72, 472, 370, 72, {
    fontSize: 23,
    color: "#F3E6D3",
  });
  textBox(slide, "Концептуальная презентация", 72, 648, 300, 22, {
    fontSize: 16,
    color: "#C9AE90",
  });
  slideNo(slide, 1, "#D9BE9E");
}

// 2. Material strategy
{
  const slide = deck.slides.add();
  slide.background.fill = "#FFF9F1";
  textBox(slide, "Уют работает, когда дерево —\nматериал, а не декорация", 60, 50, 790, 104, {
    fontSize: 38,
    bold: true,
    font: SERIF,
    color: "#2D211A",
  });
  textBox(slide, "Фактура появляется в рамах, нижних полосах, меню и кнопках. Поэтому сайт остается легким, а тепло ощущается физически.", 62, 166, 760, 62, {
    fontSize: 20,
    color: "#5B4638",
  });

  await image(slide, assets.wood, 864, 0, 416, 252, {
    alt: "Натуральная фактура орехового дерева",
  });
  rect(slide, 864, 0, 416, 252, "#4A2B1966");
  textBox(slide, "тактильность", 902, 172, 320, 40, {
    fontSize: 25,
    font: SCRIPT,
    color: "#FFF8EE",
    align: "right",
  });

  const concepts = [
    ["01", "Медовый дом", "Личный и сбалансированный", "#F6EBDD", "#6B432B", "#C8863F"],
    ["02", "Светлая столовая", "Воздушный и гастрономичный", "#FFF9F1", "#A9583E", "#69705C"],
    ["03", "Темный орех", "Камерный и премиальный", "#21140E", "#F3E6D3", "#C19A5B"],
    ["04", "Брусника и ясень", "Живой и событийный", "#F7F0E4", "#8F3944", "#5E6B55"],
  ];

  concepts.forEach(([num, title, body, fill, textColor, accent], index) => {
    const left = 60 + index * 302;
    rect(slide, left, 286, 274, 318, fill, {
      line: { style: "solid", fill: index === 2 ? "#3F2C20" : "#D8C6B0", width: 1 },
    });
    rect(slide, left, 286, 274, 12, accent);
    textBox(slide, num, left + 24, 324, 48, 30, {
      fontSize: 18,
      bold: true,
      color: accent,
    });
    textBox(slide, title, left + 24, 370, 224, 68, {
      fontSize: 27,
      bold: true,
      font: SERIF,
      color: textColor,
    });
    textBox(slide, body, left + 24, 460, 218, 50, {
      fontSize: 18,
      color: textColor,
    });
    rect(slide, left + 24, 548, 54, 30, accent);
    rect(slide, left + 88, 548, 54, 30, fill, {
      line: { style: "solid", fill: textColor, width: 1 },
    });
    rect(slide, left + 152, 548, 54, 30, textColor);
  });
  textBox(slide, "Везде: крупные реальные фотографии, спокойная типографика и один ясный путь — разговор с Катериной.", 60, 640, 1100, 30, {
    fontSize: 18,
    color: "#6E594B",
  });
  slideNo(slide, 2, "#8C7463");
}

// 3. Concept 1: home
{
  const slide = deck.slides.add();
  slide.background.fill = "#F6EBDD";
  nav(slide, { fill: "#F6EBDD", color: "#2D211A", accent: "#C8863F", border: "#D9C5AB" });
  await image(slide, assets.house, 650, 72, 630, 566, {
    alt: "Один гостевой дом у лесистых сопок",
    crop: { left: 0.18, top: 0, right: 0, bottom: 0 },
  });
  rect(slide, 0, 638, W, 82, "#6B432B");
  await image(slide, assets.wood, 0, 638, W, 82, { alt: "Полоса натурального дерева" });
  rect(slide, 0, 638, W, 82, "#3A201B66");

  conceptStamp(slide, "01", "МЕДОВЫЙ ДОМ · ГЛАВНАЯ", "#F6EBDD", "#6B432B");
  textBox(slide, "Дом у подножия\nПидана, где\nвстречают лично", 64, 144, 520, 184, {
    fontSize: 47,
    bold: true,
    font: SERIF,
    color: "#2D211A",
  });
  textBox(slide, "Пять комнат в одном доме, баня, общая кухня и большой стол. Катерина поможет собрать поездку под ваш ритм.", 66, 358, 488, 82, {
    fontSize: 21,
    color: "#5B4638",
  });
  button(slide, "СВЯЗАТЬСЯ С КАТЕРИНОЙ", 66, 474, 284, "#6B432B", "#FFF8EE");
  textBox(slide, "Приморский край · д. Лукьяновка", 66, 548, 350, 24, {
    fontSize: 16,
    color: "#7C6658",
  });
  textBox(slide, "как к своим", 974, 654, 232, 34, {
    fontSize: 23,
    font: SCRIPT,
    color: "#FFF3E2",
    align: "right",
  });
  slideNo(slide, 3, "#F1D7B7");
}

// 4. Concept 1: host
{
  const slide = deck.slides.add();
  slide.background.fill = "#F6EBDD";
  nav(slide, { fill: "#F6EBDD", color: "#2D211A", accent: "#C8863F", border: "#D9C5AB" });
  await image(slide, assets.host, 0, 72, 650, 648, {
    alt: "Фотореференс хозяйки за большим деревянным столом",
    crop: { left: 0.03, top: 0, right: 0.06, bottom: 0 },
  });
  rect(slide, 650, 72, 630, 648, "#F6EBDD");
  rect(slide, 650, 72, 18, 648, "#C8863F");
  conceptStamp(slide, "01", "МЕДОВЫЙ ДОМ · КАТЕРИНА", "#F6EBDD", "#6B432B");
  textBox(slide, "Катерина встречает\nгостей как дома", 720, 132, 490, 112, {
    fontSize: 42,
    bold: true,
    font: SERIF,
    color: "#2D211A",
  });
  textBox(slide, "«Мне важно не просто дать ключ от комнаты. Хочется понять, зачем вы приехали: выдохнуть, подняться к сопкам, собраться своей компанией или долго сидеть за столом».", 722, 282, 460, 132, {
    fontSize: 22,
    color: "#5A4437",
  });
  line(slide, 722, 448, 86, 0, "#C8863F", 4);
  textBox(slide, "Хозяйка дома · локальная кухня · маршруты рядом", 722, 476, 458, 56, {
    fontSize: 19,
    color: "#6B432B",
  });
  button(slide, "НАПИСАТЬ КАТЕРИНЕ", 722, 562, 246, "#6B432B", "#FFF8EE");
  textBox(slide, "Фотореференс; заменить реальным портретом Катерины", 722, 648, 462, 24, {
    fontSize: 16,
    color: "#8A7466",
  });
  slideNo(slide, 4, "#8C7463");
}

// 5. Concept 2: home
{
  const slide = deck.slides.add();
  slide.background.fill = "#FFF9F1";
  nav(slide, { fill: "#FFF9F1", color: "#3B2E26", accent: "#A9583E", border: "#E7D6BF" });
  await image(slide, assets.house, 0, 72, W, 392, {
    alt: "Теплый деревянный дом в горах Приморья",
    crop: { left: 0, top: 0.08, right: 0, bottom: 0.08 },
  });
  rect(slide, 0, 72, 680, 392, "#2B1B126F");
  conceptStamp(slide, "02", "СВЕТЛАЯ СТОЛОВАЯ · ГЛАВНАЯ", "#FFF9F1", "#A9583E");
  textBox(slide, "Маори\nЛукьяновка", 64, 148, 490, 116, {
    fontSize: 51,
    bold: true,
    font: SERIF,
    color: "#FFF9F1",
  });
  textBox(slide, "Один дом, пять комнат и теплая встреча у подножия Пидана", 66, 292, 470, 66, {
    fontSize: 23,
    color: "#FFF6EA",
  });
  button(slide, "СВЯЗАТЬСЯ С КАТЕРИНОЙ", 66, 382, 284, "#A9583E", "#FFFFFF");

  textBox(slide, "Здесь важен не номер,\nа ваш день целиком", 64, 500, 360, 76, {
    fontSize: 28,
    bold: true,
    font: SERIF,
    color: "#3B2E26",
  });
  const facts = [
    ["01", "ДОМ", "Пять комнат\nи общая гостиная"],
    ["02", "ВКУС", "Локальная кухня\nи застолья"],
    ["03", "РЯДОМ", "Пидан, лес\nи маршруты"],
  ];
  facts.forEach(([num, label, body], index) => {
    const left = 500 + index * 236;
    textBox(slide, num, left, 504, 38, 22, { fontSize: 16, bold: true, color: "#A9583E" });
    textBox(slide, label, left, 540, 170, 24, { fontSize: 18, bold: true, color: "#3B2E26" });
    textBox(slide, body, left, 578, 190, 58, { fontSize: 18, color: "#69705C" });
    if (index < 2) line(slide, left + 204, 502, 0, 124, "#E2D1BC", 1);
  });
  textBox(slide, "свет, воздух, еда", 64, 640, 280, 28, {
    fontSize: 21,
    font: SCRIPT,
    color: "#A9583E",
  });
  slideNo(slide, 5, "#8C7463");
}

// 6. Concept 2: food and festivals
{
  const slide = deck.slides.add();
  slide.background.fill = "#FFF9F1";
  nav(slide, { fill: "#FFF9F1", color: "#3B2E26", accent: "#A9583E", border: "#E7D6BF" });
  await image(slide, assets.table, 0, 72, 744, 648, {
    alt: "Гости за длинным столом с домашней едой",
    crop: { left: 0.03, top: 0, right: 0.02, bottom: 0 },
  });
  rect(slide, 0, 534, 744, 186, "#342119B3");
  conceptStamp(slide, "02", "СВЕТЛАЯ СТОЛОВАЯ · ВКУС", "#FFF9F1", "#A9583E");
  textBox(slide, "Большой стол —\nчасть путешествия", 58, 564, 510, 80, {
    fontSize: 36,
    bold: true,
    font: SERIF,
    color: "#FFF9F1",
  });
  textBox(slide, "домашние блюда · местные продукты · разговоры допоздна", 60, 658, 620, 24, {
    fontSize: 17,
    color: "#F2DEC8",
  });

  rect(slide, 744, 72, 536, 648, "#FFF9F1");
  textBox(slide, "События, ради которых\nвозвращаются", 796, 126, 410, 88, {
    fontSize: 34,
    bold: true,
    font: SERIF,
    color: "#3B2E26",
  });
  const events = [
    ["ПЕЛЬМЕНЬ ВАРЕНЬ", "Теплый фестиваль вокруг общего стола", "#A9583E"],
    ["ФЕСТИВАЛЬ БОРЩА", "Домашние рецепты, гости и большой обед", "#69705C"],
  ];
  events.forEach(([title, body, accent], index) => {
    const top = 272 + index * 144;
    line(slide, 796, top, 376, 0, "#DCC8AF", 1);
    rect(slide, 796, top + 28, 10, 72, accent);
    textBox(slide, title, 830, top + 24, 340, 24, {
      fontSize: 19,
      bold: true,
      color: "#3B2E26",
    });
    textBox(slide, body, 830, top + 58, 338, 54, {
      fontSize: 18,
      color: "#69705C",
    });
  });
  textBox(slide, "Даты публикуются после подтверждения Катериной", 796, 568, 380, 46, {
    fontSize: 17,
    color: "#8A7466",
  });
  button(slide, "УЗНАТЬ О БЛИЖАЙШЕМ СОБЫТИИ", 796, 634, 380, "#A9583E", "#FFFFFF");
  slideNo(slide, 6, "#8C7463");
}

// 7. Concept 3: home
{
  const slide = deck.slides.add();
  slide.background.fill = "#21140E";
  await image(slide, assets.wood, 0, 0, 618, H, { alt: "Темная фактура орехового дерева" });
  rect(slide, 0, 0, 618, H, "#170D09A8");
  await image(slide, assets.house, 618, 0, 662, H, {
    alt: "Теплый деревянный дом вечером",
    crop: { left: 0.22, top: 0, right: 0, bottom: 0 },
  });
  rect(slide, 618, 0, 662, H, "#2A150F2F");
  rect(slide, 0, 0, W, 76, "#21140ED9");
  textBox(slide, "МАОРИ", 52, 22, 150, 28, { fontSize: 23, bold: true, font: SERIF, color: "#F3E6D3" });
  textBox(slide, "Дом     Комнаты     Катерина     Отдых", 408, 28, 470, 22, {
    fontSize: 16,
    color: "#E3D1BB",
    align: "center",
  });
  button(slide, "СВЯЗАТЬСЯ", 1046, 14, 176, "#C19A5B", "#21140E");
  conceptStamp(slide, "03", "ТЕМНЫЙ ОРЕХ · ГЛАВНАЯ", "#21140E", "#F3E6D3");
  textBox(slide, "Вечер начинается\nс теплого света\nв окнах", 62, 148, 486, 178, {
    fontSize: 46,
    bold: true,
    font: SERIF,
    color: "#FFF4E5",
  });
  textBox(slide, "Камерный дом в Лукьяновке. Пять комнат, баня и хозяйка, которая знает, как сделать поездку вашей.", 64, 362, 452, 88, {
    fontSize: 21,
    color: "#E2CFB8",
  });
  button(slide, "НАПИСАТЬ КАТЕРИНЕ", 64, 494, 250, "#C19A5B", "#21140E");
  textBox(slide, "не гостиница. дом.", 64, 584, 330, 32, {
    fontSize: 24,
    font: SCRIPT,
    color: "#D9AF75",
  });
  rect(slide, 938, 574, 268, 80, "#21140ED9");
  textBox(slide, "ПРИМОРЬЕ", 962, 592, 220, 20, { fontSize: 16, bold: true, color: "#C19A5B" });
  textBox(slide, "у подножия Пидана", 962, 620, 220, 20, { fontSize: 17, color: "#F3E6D3" });
  slideNo(slide, 7, "#E1C9AB");
}

// 8. Concept 3: rooms
{
  const slide = deck.slides.add();
  slide.background.fill = "#21140E";
  rect(slide, 0, 0, W, 74, "#21140E");
  textBox(slide, "МАОРИ", 52, 22, 150, 28, { fontSize: 23, bold: true, font: SERIF, color: "#F3E6D3" });
  textBox(slide, "Дом     Комнаты     Катерина     Отдых", 408, 28, 470, 22, {
    fontSize: 16,
    color: "#E3D1BB",
    align: "center",
  });
  button(slide, "СВЯЗАТЬСЯ", 1046, 14, 176, "#C19A5B", "#21140E");
  await image(slide, assets.room, 0, 74, 792, 646, {
    alt: "Уютная комната в одном деревянном доме",
    crop: { left: 0.02, top: 0, right: 0.05, bottom: 0 },
  });
  rect(slide, 0, 74, 792, 646, "#1B0F0A1F");
  rect(slide, 0, 526, 792, 194, "#1B0F0AB3");
  conceptStamp(slide, "03", "ТЕМНЫЙ ОРЕХ · КОМНАТЫ", "#21140E", "#F3E6D3");
  textBox(slide, "Пять комнат\nв одном доме", 56, 552, 390, 82, {
    fontSize: 39,
    bold: true,
    font: SERIF,
    color: "#FFF4E5",
  });
  textBox(slide, "Выберите характер комнаты, а не отдельный домик", 58, 650, 520, 28, {
    fontSize: 18,
    color: "#E2CFB8",
  });

  rect(slide, 792, 74, 488, 646, "#2A1B14");
  textBox(slide, "КОМНАТЫ", 840, 118, 250, 22, { fontSize: 16, bold: true, color: "#C19A5B" });
  const rooms = ["Светлая", "Лесная", "Тихая", "Семейная", "Мансарда"];
  rooms.forEach((room, index) => {
    const top = 168 + index * 78;
    textBox(slide, `0${index + 1}`, 840, top, 38, 24, { fontSize: 16, color: "#C19A5B" });
    textBox(slide, room, 900, top - 2, 220, 28, {
      fontSize: 23,
      bold: index === 0,
      font: SERIF,
      color: index === 0 ? "#FFF4E5" : "#D3C0AB",
    });
    textBox(slide, index === 0 ? "2 гостя · двуспальная кровать" : "смотреть комнату", 900, top + 32, 260, 22, {
      fontSize: 16,
      color: index === 0 ? "#CDB497" : "#877462",
    });
    line(slide, 840, top + 62, 360, 0, "#4D392D", 1);
  });
  button(slide, "ОБСУДИТЬ КОМНАТУ", 840, 604, 260, "#C19A5B", "#21140E");
  slideNo(slide, 8, "#A99076");
}

// 9. Concept 4: home
{
  const slide = deck.slides.add();
  slide.background.fill = "#F7F0E4";
  rect(slide, 0, 0, 20, H, "#8F3944");
  nav(slide, { fill: "#F7F0E4", color: "#2C2923", accent: "#8F3944", border: "#D8C3A4" });
  await image(slide, assets.house, 48, 112, 686, 520, {
    alt: "Гостевой дом в Приморье в теплом вечернем свете",
    crop: { left: 0.12, top: 0, right: 0.04, bottom: 0 },
  });
  rect(slide, 84, 566, 324, 94, "#F7F0E4");
  textBox(slide, "Лукьяновка · Приморье", 108, 588, 270, 22, { fontSize: 16, bold: true, color: "#8F3944" });
  textBox(slide, "один дом · пять комнат", 108, 620, 270, 22, { fontSize: 18, color: "#5E6B55" });
  conceptStamp(slide, "04", "БРУСНИКА И ЯСЕНЬ · ГЛАВНАЯ", "#F7F0E4", "#8F3944");
  textBox(slide, "Дом, где\nпутешествие становится\nличным", 790, 144, 430, 170, {
    fontSize: 38,
    bold: true,
    font: SERIF,
    color: "#2C2923",
  });
  textBox(slide, "Катерина принимает гостей, готовит, советует маршруты и помогает собрать отдых для пары или целой группы.", 792, 338, 388, 92, {
    fontSize: 21,
    color: "#5D554A",
  });
  textBox(slide, "приезжайте к столу", 792, 456, 338, 36, {
    fontSize: 23,
    font: SCRIPT,
    color: "#8F3944",
  });
  button(slide, "СВЯЗАТЬСЯ С КАТЕРИНОЙ", 792, 520, 294, "#8F3944", "#FFFFFF");
  line(slide, 792, 606, 390, 0, "#D8C3A4", 1);
  textBox(slide, "Дом  ·  Комнаты  ·  Еда  ·  Маршруты", 792, 632, 390, 22, {
    fontSize: 16,
    color: "#5E6B55",
  });
  slideNo(slide, 9, "#8C7463");
}

// 10. Concept 4: groups
{
  const slide = deck.slides.add();
  slide.background.fill = "#F7F0E4";
  rect(slide, 0, 0, 20, H, "#8F3944");
  nav(slide, { fill: "#F7F0E4", color: "#2C2923", accent: "#8F3944", border: "#D8C3A4" });
  conceptStamp(slide, "04", "БРУСНИКА И ЯСЕНЬ · ГРУППЫ", "#F7F0E4", "#8F3944");
  textBox(slide, "Собрать своих\nв одном доме", 62, 126, 470, 98, {
    fontSize: 42,
    bold: true,
    font: SERIF,
    color: "#2C2923",
  });
  textBox(slide, "Ретрит, семейная встреча, камерный праздник или поездка после маршрута — Катерина поможет договориться о ритме, питании и деталях.", 64, 258, 470, 112, {
    fontSize: 21,
    color: "#5D554A",
  });
  const tags = ["до 5 комнат", "общий стол", "баня", "маршруты"];
  tags.forEach((label, index) => {
    const left = 64 + (index % 2) * 210;
    const top = 410 + Math.floor(index / 2) * 62;
    rect(slide, left, top, 190, 42, index === 0 ? "#8F3944" : "#E7D6BF", {
      borderRadius: 4,
      line: { style: "solid", fill: index === 0 ? "#8F3944" : "#D0B897", width: 1 },
    });
    textBox(slide, label, left, top + 12, 190, 20, {
      fontSize: 16,
      bold: true,
      color: index === 0 ? "#FFFFFF" : "#2C2923",
      align: "center",
    });
  });
  button(slide, "ОБСУДИТЬ ПОЕЗДКУ", 64, 558, 252, "#8F3944", "#FFFFFF");
  textBox(slide, "сначала разговор", 64, 630, 300, 28, {
    fontSize: 22,
    font: SCRIPT,
    color: "#8F3944",
  });

  await image(slide, assets.table, 582, 104, 698, 616, {
    alt: "Камерная группа гостей за большим столом",
    crop: { left: 0.02, top: 0, right: 0.03, bottom: 0 },
  });
  rect(slide, 582, 548, 698, 172, "#283023A8");
  textBox(slide, "Ужин после маршрута", 626, 580, 440, 38, {
    fontSize: 29,
    bold: true,
    font: SERIF,
    color: "#FFF8EE",
  });
  textBox(slide, "меню и формат встречи обсуждаются лично", 628, 638, 430, 24, {
    fontSize: 17,
    color: "#E8DCC9",
  });
  slideNo(slide, 10, "#F1E3D0");
}

// 11. Comparison and recommendation
{
  const slide = deck.slides.add();
  slide.background.fill = "#FFF9F1";
  textBox(slide, "Четыре способа передать тепло одного дома", 60, 44, 960, 58, {
    fontSize: 39,
    bold: true,
    font: SERIF,
    color: "#2D211A",
  });
  textBox(slide, "Выбор зависит от того, какой мотив должен прозвучать первым: хозяйка, еда, вечерний уют или события.", 62, 120, 930, 36, {
    fontSize: 20,
    color: "#6E594B",
  });

  const options = [
    ["01", "Медовый дом", "Хозяйка + дом", "Самый теплый и универсальный", "#F6EBDD", "#6B432B", "#C8863F"],
    ["02", "Светлая столовая", "Еда + воздух", "Самый легкий и гастрономичный", "#FFF9F1", "#A9583E", "#69705C"],
    ["03", "Темный орех", "Вечер + тишина", "Самый камерный и дорогой", "#21140E", "#F3E6D3", "#C19A5B"],
    ["04", "Брусника и ясень", "События + группы", "Самый живой и характерный", "#F7F0E4", "#8F3944", "#5E6B55"],
  ];

  options.forEach(([num, title, focus, verdict, fill, ink, accent], index) => {
    const left = 60 + index * 302;
    rect(slide, left, 196, 274, 340, fill, {
      line: { style: "solid", fill: index === 0 ? "#C8863F" : "#D7C5AE", width: index === 0 ? 3 : 1 },
    });
    rect(slide, left, 196, 274, 12, accent);
    textBox(slide, num, left + 24, 234, 44, 24, { fontSize: 17, bold: true, color: accent });
    textBox(slide, title, left + 24, 278, 224, 62, {
      fontSize: 26,
      bold: true,
      font: SERIF,
      color: ink,
    });
    textBox(slide, focus, left + 24, 360, 220, 26, { fontSize: 18, bold: true, color: accent });
    line(slide, left + 24, 408, 210, 0, index === 2 ? "#594234" : "#D8C6B0", 1);
    textBox(slide, verdict, left + 24, 438, 220, 56, { fontSize: 18, color: ink });
    if (index === 0) {
      rect(slide, left + 24, 506, 144, 28, "#C8863F");
      textBox(slide, "РЕКОМЕНДАЦИЯ", left + 24, 513, 144, 16, {
        fontSize: 16,
        bold: true,
        color: "#2D211A",
        align: "center",
      });
    }
  });

  rect(slide, 60, 574, 1154, 84, "#2D211A");
  textBox(slide, "Рекомендация", 88, 594, 180, 22, {
    fontSize: 17,
    bold: true,
    color: "#C8863F",
  });
  textBox(slide, "Взять «Медовый дом» за основу и добавить больше светлых пауз из варианта 02.", 278, 592, 880, 30, {
    fontSize: 20,
    bold: true,
    font: SERIF,
    color: "#FFF8EE",
  });
  textBox(slide, "Итог: дорогой, теплый сайт с Катериной в центре истории.", 278, 628, 820, 22, {
    fontSize: 17,
    color: "#D9C4AA",
  });
  slideNo(slide, 11, "#8C7463");
}

await fs.mkdir(path.join(scratchRoot, "preview"), { recursive: true });
await fs.mkdir(path.join(scratchRoot, "layout"), { recursive: true });

for (const [index, slide] of deck.slides.items.entries()) {
  const stem = `slide-${String(index + 1).padStart(2, "0")}`;
  const png = await deck.export({ slide, format: "png", scale: 1 });
  await writeBlob(path.join(scratchRoot, "preview", `${stem}.png`), png);
  const layout = await slide.export({ format: "layout" });
  await fs.writeFile(path.join(scratchRoot, "layout", `${stem}.json`), await layout.text(), "utf8");
}

const montage = await deck.export({ format: "webp", montage: true, scale: 1 });
await writeBlob(path.join(scratchRoot, "preview", "montage.webp"), montage);

await fs.mkdir(path.dirname(outputPath), { recursive: true });
const pptx = await PresentationFile.exportPptx(deck);
await pptx.save(outputPath);

console.log(JSON.stringify({ outputPath, slides: deck.slides.items.length }));
