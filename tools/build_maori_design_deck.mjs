import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const [repoRoot, scratchRoot, outputPath] = process.argv.slice(2);

if (!repoRoot || !scratchRoot || !outputPath) {
  throw new Error("Usage: node build_maori_design_deck.mjs <repo-root> <scratch-root> <output-pptx>");
}

const W = 1280;
const H = 720;
const NONE = "#00000000";
const FONT_SERIF = "Georgia";
const FONT_SANS = "Arial";
const FONT_SCRIPT = "Segoe Print";

const assets = {
  hero: path.join(repoRoot, "assets", "maori-hero.png"),
  host: path.join(repoRoot, "assets", "host-table.png"),
  room: path.join(repoRoot, "assets", "room-interior.png"),
  premium: path.join(repoRoot, "assets", "concept-premium.png"),
  maori: path.join(repoRoot, "assets", "concept-maori.png"),
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

function addRect(slide, left, top, width, height, fill, options = {}) {
  return slide.shapes.add({
    geometry: options.geometry ?? "rect",
    name: options.name,
    position: { left, top, width, height },
    fill,
    line: options.line ?? { style: "solid", fill: NONE, width: 0 },
    borderRadius: options.borderRadius,
    shadow: options.shadow,
  });
}

function addLine(slide, left, top, width, color, weight = 1) {
  return slide.shapes.add({
    geometry: "line",
    position: { left, top, width, height: 0 },
    fill: NONE,
    line: { style: "solid", fill: color, width: weight },
  });
}

function addText(slide, text, left, top, width, height, options = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    name: options.name,
    position: { left, top, width, height },
    fill: options.fill ?? NONE,
    line: options.line ?? { style: "solid", fill: NONE, width: 0 },
    borderRadius: options.borderRadius,
  });
  shape.text = text;
  shape.text.fontSize = options.fontSize ?? 24;
  shape.text.color = options.color ?? "#111111";
  shape.text.bold = Boolean(options.bold);
  shape.text.typeface = options.font ?? FONT_SANS;
  shape.text.alignment = options.align ?? "left";
  shape.text.verticalAlignment = options.valign ?? "top";
  shape.text.insets = options.insets ?? { left: 0, right: 0, top: 0, bottom: 0 };
  return shape;
}

async function addImage(slide, imagePath, left, top, width, height, options = {}) {
  return slide.images.add({
    blob: await imageBytes(imagePath),
    contentType: "image/png",
    alt: options.alt ?? "Визуальный референс Маори Лукьяновка",
    fit: options.fit ?? "cover",
    crop: options.crop,
    geometry: options.geometry ?? "rect",
    borderRadius: options.borderRadius,
    position: { left, top, width, height },
  });
}

function addSlideNumber(slide, number, color = "#777777") {
  addText(slide, String(number).padStart(2, "0"), 1196, 672, 44, 20, {
    fontSize: 16,
    color,
    align: "right",
  });
}

function addSwatches(slide, colors, left, top, labelColor, width = 66) {
  colors.forEach((color, index) => {
    addRect(slide, left + index * (width + 14), top, width, 34, color, {
      line: { style: "solid", fill: labelColor, width: 1 },
    });
    addText(slide, color.toUpperCase(), left + index * (width + 14), top + 42, width, 18, {
      fontSize: 12,
      color: labelColor,
      align: "center",
    });
  });
}

function addTag(slide, text, left, top, width, fill, color) {
  addRect(slide, left, top, width, 34, fill, {
    geometry: "roundRect",
    borderRadius: 17,
    line: { style: "solid", fill: color, width: 1 },
  });
  addText(slide, text, left, top + 7, width, 20, {
    fontSize: 14,
    bold: true,
    color,
    align: "center",
  });
}

async function writeBlob(filePath, blob) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

const presentation = Presentation.create({ slideSize: { width: W, height: H } });

// 1. Cover
{
  const slide = presentation.slides.add();
  slide.background.fill = "#0B0B0B";
  await addImage(slide, assets.hero, 500, 0, 780, 720, {
    alt: "Черно-белый горный пейзаж и дом в лесу",
    crop: { left: 0.08, top: 0, right: 0, bottom: 0 },
  });
  addRect(slide, 0, 0, 500, 720, "#0B0B0B");
  addText(slide, "Маори\nЛукьяновка", 72, 90, 420, 158, {
    fontSize: 52,
    bold: true,
    color: "#F6F4EF",
    font: FONT_SERIF,
  });
  addText(slide, "Сайт о доме, где гостей\nвстречает Катерина", 76, 286, 360, 78, {
    fontSize: 25,
    color: "#D2D0CB",
  });
  addLine(slide, 76, 406, 72, "#F6F4EF", 2);
  addText(slide, "пять дизайн-направлений", 76, 438, 350, 42, {
    fontSize: 25,
    color: "#F6F4EF",
    font: FONT_SCRIPT,
  });
  addText(slide, "Структура • цвет • верстка", 76, 624, 330, 24, {
    fontSize: 16,
    color: "#8F8E8A",
  });
  addSlideNumber(slide, 1, "#B6B5B0");
}

// 2. Positioning
{
  const slide = presentation.slides.add();
  slide.background.fill = "#F6F4EF";
  addText(slide, "Сайт должен ощущаться как приглашение в дом,\nа не как каталог жилья", 64, 58, 830, 116, {
    fontSize: 43,
    bold: true,
    font: FONT_SERIF,
    color: "#111111",
  });
  addLine(slide, 64, 205, 1152, "#C8C5BE", 1);

  const items = [
    ["01", "Герой", "Катерина и ее личное гостеприимство"],
    ["02", "Продукт", "Пять комнат в одном доме"],
    ["03", "Конверсия", "Диалог и подтверждение вместо мгновенной оплаты"],
  ];
  items.forEach(([num, label, body], index) => {
    const top = 250 + index * 104;
    addText(slide, num, 68, top, 48, 28, { fontSize: 17, color: "#8A2635", bold: true });
    addText(slide, label, 130, top - 2, 168, 30, { fontSize: 22, bold: true, color: "#111111" });
    addText(slide, body, 300, top - 2, 520, 48, { fontSize: 20, color: "#494744" });
  });

  addRect(slide, 858, 246, 358, 292, "#111111");
  addText(slide, "Главное действие", 896, 286, 280, 28, {
    fontSize: 16,
    color: "#A8A59F",
  });
  addText(slide, "Связаться\nс Катериной", 896, 334, 280, 90, {
    fontSize: 37,
    bold: true,
    color: "#FFFFFF",
    font: FONT_SERIF,
  });
  addRect(slide, 896, 454, 246, 48, "#F6F4EF");
  addText(slide, "НАПИСАТЬ  →", 896, 469, 246, 22, {
    fontSize: 16,
    bold: true,
    align: "center",
    color: "#111111",
  });

  addText(slide, "Первый экран  →  доверие  →  выбор комнаты  →  разговор  →  подтверждение", 64, 620, 1100, 32, {
    fontSize: 19,
    color: "#57544F",
  });
  addSlideNumber(slide, 2);
}

// 3. Information architecture
{
  const slide = presentation.slides.add();
  slide.background.fill = "#111111";
  addText(slide, "Один дом становится сайтом из пяти понятных страниц", 64, 44, 1000, 108, {
    fontSize: 40,
    bold: true,
    font: FONT_SERIF,
    color: "#F6F4EF",
  });
  addText(slide, "Каждая страница отвечает на один вопрос гостя и ведет к разговору с Катериной.", 66, 158, 920, 38, {
    fontSize: 20,
    color: "#B6B4AE",
  });

  const pages = [
    ["01", "Главная", "Первый экран\nКоротко о доме\nКатерина\nГлавный CTA"],
    ["02", "Дом и комнаты", "Расположение\nВместимость\nБаня, кухня, барбекю\n5 комнат • галерея"],
    ["03", "Катерина и кухня", "Живой рассказ\nПортрет хозяйки\nЛокальная кухня\nФото еды"],
    ["04", "События и отдых", "Фестивали и даты\nРетриты и группы\nЭкскурсии\nАктивности рядом"],
    ["05", "Бронь", "Отзывы-слайдер\nДиалог и контакты\nКарта и соцсети\nОплата • политика"],
  ];
  pages.forEach(([num, title, body], index) => {
    const left = 64 + index * 232;
    if (index > 0) addLine(slide, left - 18, 218, 0, "#343434", 1).position = { left: left - 18, top: 218, width: 0, height: 386 };
    addText(slide, num, left, 212, 50, 26, { fontSize: 16, bold: true, color: "#8A2635" });
    addText(slide, title, left, 254, 210, 68, { fontSize: 24, bold: true, color: "#FFFFFF", font: FONT_SERIF });
    addText(slide, body, left, 344, 204, 170, { fontSize: 18, color: "#C9C7C2" });
  });
  addText(slide, "Стабильная навигация:  Дом  •  Комнаты  •  Катерина  •  Отдых  •  Бронь", 64, 634, 1060, 26, {
    fontSize: 18,
    color: "#EFEDE7",
  });
  addSlideNumber(slide, 3, "#777777");
}

// 4. Option 1
{
  const slide = presentation.slides.add();
  slide.background.fill = "#F7F6F2";
  await addImage(slide, assets.hero, 0, 0, 696, 720, {
    alt: "Черно-белый дом у сопок",
    crop: { left: 0.12, top: 0, right: 0.04, bottom: 0 },
  });
  addRect(slide, 696, 0, 584, 720, "#F7F6F2");
  addText(slide, "вариант 01", 752, 56, 200, 28, { fontSize: 16, bold: true, color: "#77746F" });
  addText(slide, "Черно-белая\nредакционная", 752, 104, 454, 122, {
    fontSize: 45,
    bold: true,
    color: "#0B0B0B",
    font: FONT_SERIF,
  });
  addText(slide, "тихий дорогой ритм", 752, 246, 370, 40, {
    fontSize: 24,
    color: "#0B0B0B",
    font: FONT_SCRIPT,
  });
  addLine(slide, 752, 312, 72, "#0B0B0B", 2);
  addText(slide, "Асимметричный первый экран, длинные фото-полосы, крупная типографика и короткие рукописные заметки Катерины.", 752, 346, 440, 96, {
    fontSize: 20,
    color: "#42403C",
  });
  addTag(slide, "самый премиальный", 752, 476, 184, "#F7F6F2", "#0B0B0B");
  addSwatches(slide, ["#0B0B0B", "#F7F6F2", "#BDBDB8", "#FFFFFF"], 752, 548, "#3B3935");
  addText(slide, "Лучше всего раскрывает личный бренд Катерины и остается верным черно-белой основе.", 752, 634, 450, 44, {
    fontSize: 17,
    color: "#5C5954",
  });
  addSlideNumber(slide, 4);
}

// 5. Option 2
{
  const slide = presentation.slides.add();
  slide.background.fill = "#101311";
  await addImage(slide, assets.room, 0, 0, 1280, 410, {
    alt: "Спокойная спальня с видом на лес",
    crop: { left: 0, top: 0.03, right: 0, bottom: 0.14 },
  });
  addRect(slide, 0, 410, 1280, 310, "#101311");
  addRect(slide, 64, 410, 6, 222, "#405247");
  addText(slide, "вариант 02", 96, 446, 180, 22, { fontSize: 16, bold: true, color: "#91A094" });
  addText(slide, "Тайга и графит", 96, 484, 480, 62, {
    fontSize: 46,
    bold: true,
    color: "#F1F1EC",
    font: FONT_SERIF,
  });
  addText(slide, "Темный фотожурнал: комнаты и природа идут широкими кадрами, а зеленый акцент отмечает маршруты, баню и активности.", 96, 560, 530, 70, {
    fontSize: 20,
    color: "#C9D0C5",
  });
  addTag(slide, "спокойствие и природа", 716, 454, 220, "#101311", "#C9D0C5");
  addSwatches(slide, ["#101311", "#405247", "#C9D0C5", "#F1F1EC"], 716, 532, "#D8DED4");
  addText(slide, "Сильнее всего работает для ретритов, групп и отдыха после маршрутов.", 716, 622, 440, 42, {
    fontSize: 17,
    color: "#AEB8AD",
  });
  addSlideNumber(slide, 5, "#8D978D");
}

// 6. Option 3
{
  const slide = presentation.slides.add();
  slide.background.fill = "#F1E9DD";
  addRect(slide, 0, 0, 22, 720, "#8A2635");
  addText(slide, "вариант 03", 70, 58, 180, 22, { fontSize: 16, bold: true, color: "#8A2635" });
  addText(slide, "Домашний стол", 70, 104, 520, 62, {
    fontSize: 48,
    bold: true,
    color: "#171513",
    font: FONT_SERIF,
  });
  addText(slide, "Катерина становится центром истории: ее голос, кухня, большой стол и события связывают все страницы.", 70, 194, 480, 102, {
    fontSize: 22,
    color: "#4F4842",
  });
  addText(slide, "“Приезжайте как к своим”", 70, 334, 470, 46, {
    fontSize: 25,
    color: "#8A2635",
    font: FONT_SCRIPT,
  });
  addTag(slide, "самый теплый", 70, 414, 164, "#F1E9DD", "#8A2635");
  addSwatches(slide, ["#171513", "#F1E9DD", "#8A2635", "#B79B64"], 70, 502, "#4A433D");
  addText(slide, "Идеален, если кухня и фестивали должны стать вторым большим поводом приехать после самого дома.", 70, 602, 480, 52, {
    fontSize: 18,
    color: "#514943",
  });
  await addImage(slide, assets.host, 610, 0, 670, 720, {
    alt: "Хозяйка наливает чай за домашним столом",
    crop: { left: 0.06, top: 0, right: 0, bottom: 0 },
  });
  addSlideNumber(slide, 6, "#E5DCCC");
}

// 7. Option 4
{
  const slide = presentation.slides.add();
  slide.background.fill = "#DDE1DF";
  addRect(slide, 0, 0, 338, 720, "#17191A");
  addRect(slide, 338, 0, 378, 720, "#DDE1DF");
  await addImage(slide, assets.premium, 716, 0, 564, 720, {
    alt: "Редакционный референс сайта Маори",
    crop: { left: 0.38, top: 0.02, right: 0, bottom: 0.14 },
  });
  addText(slide, "вариант 04", 56, 56, 180, 22, { fontSize: 16, bold: true, color: "#A6B5BB" });
  addText(slide, "Туман\nнад Пиданом", 56, 112, 242, 132, {
    fontSize: 44,
    bold: true,
    color: "#F1F3F1",
    font: FONT_SERIF,
  });
  addText(slide, "Воздух, тишина,\nмедленный ритм", 56, 288, 228, 62, {
    fontSize: 22,
    color: "#BFC9C5",
    font: FONT_SCRIPT,
  });
  addText(slide, "Верстка строится вертикальными полосами: крупный текст, спокойные поля, фотографии без декоративного шума.", 378, 104, 292, 118, {
    fontSize: 21,
    color: "#2D3330",
  });
  addText(slide, "Лучший сценарий", 378, 284, 250, 26, { fontSize: 17, bold: true, color: "#667269" });
  addText(slide, "Ретриты • камерные группы\nприродные маршруты • баня", 378, 326, 300, 66, {
    fontSize: 20,
    color: "#242926",
  });
  addSwatches(slide, ["#17191A", "#DDE1DF", "#7C8B7D", "#A6B5BB"], 378, 484, "#37403A");
  addText(slide, "Самый спокойный вариант, но хозяйка и кухня потребуют более теплых фотографий.", 378, 584, 292, 62, {
    fontSize: 17,
    color: "#515B54",
  });
  addSlideNumber(slide, 7, "#E2E6E3");
}

// 8. Option 5
{
  const slide = presentation.slides.add();
  slide.background.fill = "#111111";
  addRect(slide, 0, 0, 30, 720, "#BE2B30");
  addRect(slide, 30, 0, 500, 720, "#111111");
  await addImage(slide, assets.hero, 530, 0, 750, 720, {
    alt: "Крупный план одного дома у гор",
    crop: { left: 0.46, top: 0, right: 0, bottom: 0 },
  });
  addText(slide, "вариант 05", 76, 58, 180, 22, { fontSize: 16, bold: true, color: "#D1A940" });
  addText(slide, "Фестиваль\nв доме", 76, 112, 390, 124, {
    fontSize: 51,
    bold: true,
    color: "#F7F5EF",
    font: FONT_SERIF,
  });
  addText(slide, "Живее, смелее, событийнее", 76, 272, 380, 38, {
    fontSize: 22,
    color: "#F7F5EF",
    font: FONT_SCRIPT,
  });
  addLine(slide, 76, 342, 76, "#BE2B30", 4);
  addText(slide, "Крупные даты, афишная типографика, фотомозаика еды и гостей. Подходит, если фестивали становятся отдельным туристическим продуктом.", 76, 378, 388, 112, {
    fontSize: 20,
    color: "#CBC8C0",
  });
  addSwatches(slide, ["#111111", "#F7F5EF", "#BE2B30", "#D1A940"], 76, 548, "#E5E1D9");
  addText(slide, "Самый заметный вариант; требует особенно сильной реальной фотосъемки событий.", 76, 638, 402, 44, {
    fontSize: 17,
    color: "#A9A69F",
  });
  addSlideNumber(slide, 8, "#EAE6DD");
}

// 9. Recommendation
{
  const slide = presentation.slides.add();
  slide.background.fill = "#F6F4EF";
  addText(slide, "Рекомендация: основа варианта 1 + тепло варианта 3", 64, 44, 1080, 108, {
    fontSize: 40,
    bold: true,
    font: FONT_SERIF,
    color: "#111111",
  });
  addText(slide, "Так сайт будет выглядеть дорого, но не холодно.", 66, 164, 680, 32, {
    fontSize: 21,
    color: "#5B5751",
  });

  const blocks = [
    ["01", "Редакционная\nчерно-белая верстка", "#111111", "#FFFFFF"],
    ["+", "Бордовый акцент\nдля еды и событий", "#8A2635", "#FFFFFF"],
    ["+", "Спокойное появление\nи движение фото", "#DDE1DF", "#17191A"],
  ];
  blocks.forEach(([num, text, fill, color], index) => {
    const left = 64 + index * 390;
    addRect(slide, left, 222, 350, 206, fill);
    addText(slide, num, left + 28, 248, 54, 34, { fontSize: 23, bold: true, color });
    addText(slide, text, left + 28, 304, 294, 104, {
      fontSize: 25,
      bold: true,
      font: FONT_SERIF,
      color,
    });
  });

  addText(slide, "Почему это работает", 64, 486, 260, 28, { fontSize: 20, bold: true, color: "#111111" });
  addText(slide, "• Катерина остается главным лицом\n• дом ощущается камерным, а не гостиничным\n• цвет появляется только там, где есть вкус, событие или действие", 64, 528, 742, 102, {
    fontSize: 20,
    color: "#3E3A35",
  });
  addRect(slide, 862, 492, 354, 138, "#111111");
  addText(slide, "Итог", 894, 516, 120, 24, { fontSize: 16, color: "#99958E" });
  addText(slide, "Черно-белый сайт\nс человеческим теплом", 894, 548, 282, 76, {
    fontSize: 22,
    bold: true,
    color: "#FFFFFF",
    font: FONT_SERIF,
  });
  addSlideNumber(slide, 9);
}

// 10. Page plan
{
  const slide = presentation.slides.add();
  slide.background.fill = "#111111";
  addText(slide, "Пять страниц покрывают все одиннадцать обязательных блоков", 64, 42, 1080, 108, {
    fontSize: 40,
    bold: true,
    font: FONT_SERIF,
    color: "#F6F4EF",
  });
  addText(slide, "Гость видит главное быстро, а подробности получает там, где ожидает их найти.", 66, 154, 940, 32, {
    fontSize: 20,
    color: "#B9B6AF",
  });

  const cols = [
    ["ДОМ", "Первый экран\nО доме\nКоротко о Катерине\nCTA “Связаться”"],
    ["КОМНАТЫ", "5 комнат\nВместимость\nБаня • кухня • барбекю\nГалерея дома"],
    ["КАТЕРИНА", "Живой рассказ\nФото хозяйки\nЛокальная кухня\nФото еды"],
    ["ОТДЫХ", "Фестивали и даты\nРетриты и группы\nЭкскурсии\nАктивности рядом"],
    ["БРОНЬ", "Отзывы-слайдер\nДиалог бронирования\nАдрес • карта • соцсети\nОплата • политика"],
  ];
  cols.forEach(([title, body], index) => {
    const left = 64 + index * 231;
    addText(slide, `0${index + 1}`, left, 214, 42, 22, { fontSize: 16, bold: true, color: "#8A2635" });
    addText(slide, title, left, 260, 204, 30, { fontSize: 20, bold: true, color: "#FFFFFF" });
    addLine(slide, left, 310, 188, "#44433F", 1);
    addText(slide, body, left, 344, 206, 168, { fontSize: 18, color: "#CFCDC6" });
  });
  addRect(slide, 64, 564, 1152, 64, "#F6F4EF");
  addText(slide, "Единый CTA на всех страницах:  “Связаться с Катериной”", 92, 584, 800, 28, {
    fontSize: 21,
    bold: true,
    color: "#111111",
  });
  addText(slide, "Отзывы также можно повторить на главной перед CTA.", 882, 585, 304, 26, {
    fontSize: 16,
    color: "#5C5852",
    align: "right",
  });
  addSlideNumber(slide, 10, "#777777");
}

// 11. Verified facts and event dates
{
  const slide = presentation.slides.add();
  slide.background.fill = "#F6F4EF";
  addText(slide, "Проверенные факты уже дают сильный контент", 64, 44, 980, 108, {
    fontSize: 40,
    bold: true,
    font: FONT_SERIF,
    color: "#111111",
  });
  addText(slide, "Даты на сайте должны иметь статус: прошедшее событие или новый анонс.", 66, 154, 860, 32, {
    fontSize: 20,
    color: "#5C5852",
  });

  addText(slide, "О доме", 64, 208, 260, 30, { fontSize: 22, bold: true, color: "#8A2635" });
  addText(slide, "д. Лукьяновка, ул. Школьная, 11Б\n+7 914 792-58-26\nОдин дом • пять комнат\nУ подножия Пидана", 64, 258, 480, 164, {
    fontSize: 24,
    color: "#1B1A18",
  });
  addText(slide, "Подтвердить перед публикацией", 64, 464, 330, 28, { fontSize: 18, bold: true, color: "#55504A" });
  addText(slide, "точную вместимость • цены • оплату • правила с животными • соцсети", 64, 506, 500, 60, {
    fontSize: 18,
    color: "#6A655E",
  });

  addRect(slide, 604, 208, 612, 174, "#111111");
  addText(slide, "16 мая 2026", 636, 236, 220, 30, { fontSize: 23, bold: true, color: "#D1A940" });
  addText(slide, "“Пельмень Варень”", 636, 282, 330, 34, { fontSize: 28, bold: true, color: "#FFFFFF", font: FONT_SERIF });
  addText(slide, "Катерина Геращенко — организатор. Событие прошло; следующую дату показывать после анонса.", 636, 328, 540, 42, {
    fontSize: 17,
    color: "#C9C6BE",
  });

  addRect(slide, 604, 402, 612, 174, "#8A2635");
  addText(slide, "13 сентября 2025", 636, 430, 250, 30, { fontSize: 23, bold: true, color: "#F1E9DD" });
  addText(slide, "Фестиваль борща", 636, 476, 330, 34, { fontSize: 28, bold: true, color: "#FFFFFF", font: FONT_SERIF });
  addText(slide, "Последняя подтвержденная дата. Для 2026 года нужен новый официальный анонс.", 636, 522, 540, 40, {
    fontSize: 17,
    color: "#F1DBDE",
  });
  addText(slide, "Источники: VL.ru • Visit Primorye • Мой бизнес Приморье • публикации фестиваля", 64, 644, 1030, 24, {
    fontSize: 16,
    color: "#77716A",
  });
  addSlideNumber(slide, 11);
}

// 12. Reviews and close
{
  const slide = presentation.slides.add();
  slide.background.fill = "#111111";
  addText(slide, "Реальные отзывы должны говорить голосами гостей", 64, 42, 980, 108, {
    fontSize: 40,
    bold: true,
    font: FONT_SERIF,
    color: "#F6F4EF",
  });
  addText(slide, "На сайте: 3–5 коротких цитат, источник и месяц поездки; просмотр — слайдером.", 66, 154, 980, 32, {
    fontSize: 20,
    color: "#B9B6AF",
  });

  const reviews = [
    ["“Очень атмосферное и уютное место. Номера комфортные.”", "Егор П. • Tripadvisor • август 2025"],
    ["“Каждый раз это гастрономический экстаз.”", "Ольга Хохлова • 2ГИС"],
    ["“Уютные номера, вкусная еда и теплая атмосфера.”", "Татьяна Баркова • 2ГИС"],
  ];
  reviews.forEach(([quote, meta], index) => {
    const left = 64 + index * 390;
    addText(slide, "“", left, 226, 48, 50, { fontSize: 54, color: "#8A2635", font: FONT_SERIF });
    addText(slide, quote, left, 284, 340, 102, { fontSize: 23, color: "#FFFFFF", font: FONT_SERIF });
    addLine(slide, left, 414, 60, "#D1A940", 3);
    addText(slide, meta, left, 444, 340, 48, { fontSize: 16, color: "#AFAAA1" });
  });

  addRect(slide, 64, 550, 1152, 86, "#F6F4EF");
  addText(slide, "Выбираем направление → собираем реальные фото → переносим все блоки в страницы и админ-панель", 94, 578, 1088, 34, {
    fontSize: 21,
    bold: true,
    color: "#111111",
    align: "center",
  });
  addText(slide, "Источники отзывов: Tripadvisor и 2ГИС", 64, 660, 520, 22, {
    fontSize: 16,
    color: "#77736C",
  });
  addSlideNumber(slide, 12, "#777777");
}

await fs.mkdir(path.join(scratchRoot, "preview"), { recursive: true });
await fs.mkdir(path.join(scratchRoot, "layout"), { recursive: true });

for (const [index, slide] of presentation.slides.items.entries()) {
  const stem = `slide-${String(index + 1).padStart(2, "0")}`;
  const png = await presentation.export({ slide, format: "png", scale: 1 });
  await writeBlob(path.join(scratchRoot, "preview", `${stem}.png`), png);
  const layout = await slide.export({ format: "layout" });
  await fs.writeFile(path.join(scratchRoot, "layout", `${stem}.json`), await layout.text(), "utf8");
}

const montage = await presentation.export({ format: "webp", montage: true, scale: 1 });
await writeBlob(path.join(scratchRoot, "preview", "montage.webp"), montage);

await fs.mkdir(path.dirname(outputPath), { recursive: true });
const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(outputPath);

console.log(JSON.stringify({ outputPath, slides: presentation.slides.items.length }));
