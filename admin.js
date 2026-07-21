const nav = document.querySelector("#adminNav");
const editorGrid = document.querySelector("#editorGrid");
const pageTitle = document.querySelector("#pageTitle");
const statusBar = document.querySelector("#statusBar");
const saveButton = document.querySelector("#saveButton");
const exportButton = document.querySelector("#exportButton");
const loginLayer = document.querySelector("#loginLayer");
const loginForm = document.querySelector("#loginForm");
const passwordInput = document.querySelector("#passwordInput");
const loginError = document.querySelector("#loginError");

let content = null;
let activePage = "home";
let adminPassword = sessionStorage.getItem("maoriAdminPassword") || "";

const textField = (label, path, type = "text") => ({ label, path, type });
const itemField = (label, key, type = "text") => ({ label, key, type });
const arrayField = (path, itemLabel, fields, template) => ({ type: "array", path, itemLabel, fields, template });

const pageConfig = [
  {
    id: "home",
    label: "Главная",
    title: "Главная страница",
    blocks: [
      {
        title: "Первый экран",
        fields: [
          textField("Рукописная строка", "home.hero.script"),
          textField("Название", "home.hero.title"),
          textField("Подзаголовок", "home.hero.text", "textarea"),
          textField("Текст кнопки", "home.hero.button"),
          textField("Главное фото", "home.hero.image", "image"),
        ],
      },
      {
        title: "О доме",
        fields: [
          textField("Метка", "home.about.label"),
          textField("Заголовок", "home.about.title", "textarea"),
          textField("Описание", "home.about.text", "textarea"),
        ],
      },
      {
        title: "Факты о доме",
        wide: true,
        fields: [
          arrayField(
            "home.about.stats",
            "Факт",
            [itemField("Значение", "value"), itemField("Подпись", "label")],
            { value: "Новое", label: "Описание факта" }
          ),
        ],
      },
      {
        title: "Зоны дома",
        wide: true,
        fields: [
          arrayField(
            "home.about.zones",
            "Зона",
            [itemField("Название", "title"), itemField("Описание", "text", "textarea")],
            { title: "Новая зона", text: "Короткое описание." }
          ),
        ],
      },
      {
        title: "Катерина на главной",
        fields: [
          textField("Фото", "home.hostPreview.image", "image"),
          textField("Метка", "home.hostPreview.label"),
          textField("Заголовок", "home.hostPreview.title", "textarea"),
          textField("Текст", "home.hostPreview.text", "textarea"),
          textField("Ссылка-кнопка", "home.hostPreview.button"),
        ],
      },
      {
        title: "Фотогалерея",
        wide: true,
        fields: [
          textField("Метка", "home.gallery.label"),
          textField("Заголовок", "home.gallery.title", "textarea"),
          textField("Описание", "home.gallery.text", "textarea"),
          arrayField(
            "home.gallery.items",
            "Фотография",
            [
              itemField("Фото", "image", "image"),
              itemField("Категория", "category"),
              itemField("Название", "title"),
              itemField("Описание для доступности", "alt", "textarea"),
            ],
            { image: "assets/warm-house-exterior.png", category: "Дом", title: "Новый кадр", alt: "Фотография Маори" }
          ),
        ],
      },
      {
        title: "Призыв к бронированию",
        fields: [
          textField("Метка", "home.bookingStrip.label"),
          textField("Заголовок", "home.bookingStrip.title", "textarea"),
          textField("Текст", "home.bookingStrip.text", "textarea"),
          textField("Кнопка", "home.bookingStrip.button"),
        ],
      },
    ],
  },
  {
    id: "rooms",
    label: "Комнаты",
    title: "Комнаты и пространства дома",
    blocks: [
      {
        title: "Первый экран",
        fields: [
          textField("Фото", "rooms.hero.image", "image"),
          textField("Рукописная строка", "rooms.hero.script"),
          textField("Заголовок", "rooms.hero.title", "textarea"),
          textField("Описание", "rooms.hero.text", "textarea"),
        ],
      },
      {
        title: "Введение",
        fields: [
          textField("Метка", "rooms.intro.label"),
          textField("Заголовок", "rooms.intro.title", "textarea"),
          textField("Описание", "rooms.intro.text", "textarea"),
        ],
      },
      {
        title: "Пять комнат",
        wide: true,
        fields: [
          arrayField(
            "rooms.rooms",
            "Комната",
            [
              itemField("Название", "title"),
              itemField("Описание", "text", "textarea"),
              itemField("Короткие факты", "facts", "textarea"),
            ],
            { title: "Новая комната", text: "Описание комнаты.", facts: "2 гостя, цена по запросу" }
          ),
        ],
      },
      {
        title: "Общие зоны",
        wide: true,
        fields: [
          textField("Метка", "rooms.zones.label"),
          textField("Заголовок", "rooms.zones.title", "textarea"),
          textField("Описание", "rooms.zones.text", "textarea"),
          arrayField(
            "rooms.zones.items",
            "Зона",
            [itemField("Номер", "number"), itemField("Название", "title"), itemField("Описание", "text", "textarea")],
            { number: "05", title: "Новая зона", text: "Описание пространства." }
          ),
        ],
      },
      {
        title: "Перед подтверждением",
        wide: true,
        fields: [
          textField("Заголовок", "rooms.notes.title"),
          textField("Описание", "rooms.notes.text", "textarea"),
          arrayField(
            "rooms.notes.items",
            "Пункт",
            [itemField("Название", "title"), itemField("Описание", "text", "textarea")],
            { title: "Новый пункт", text: "Что важно уточнить." }
          ),
        ],
      },
      {
        title: "Нижний призыв",
        fields: [
          textField("Метка", "rooms.bookingStrip.label"),
          textField("Заголовок", "rooms.bookingStrip.title", "textarea"),
          textField("Кнопка", "rooms.bookingStrip.button"),
        ],
      },
    ],
  },
  {
    id: "host",
    label: "Катерина",
    title: "Катерина, питание и фестивали",
    blocks: [
      {
        title: "Первый экран",
        fields: [
          textField("Фото", "host.hero.image", "image"),
          textField("Рукописная строка", "host.hero.script"),
          textField("Имя", "host.hero.title"),
          textField("Подзаголовок", "host.hero.text", "textarea"),
        ],
      },
      {
        title: "История Катерины",
        wide: true,
        fields: [
          textField("Метка", "host.story.label"),
          textField("Заголовок", "host.story.title", "textarea"),
          textField("Абзацы, каждый с новой строки", "host.story.paragraphs", "list"),
        ],
      },
      {
        title: "Чем помогает",
        fields: [
          textField("Заголовок", "host.help.title", "textarea"),
          textField("Пункты, каждый с новой строки", "host.help.items", "list"),
        ],
      },
      {
        title: "Питание",
        fields: [
          textField("Фото еды", "host.food.image", "image"),
          textField("Метка", "host.food.label"),
          textField("Заголовок", "host.food.title", "textarea"),
          textField("Описание", "host.food.text", "textarea"),
          textField("Варианты, каждый с новой строки", "host.food.items", "list"),
        ],
      },
      {
        title: "Фестивали",
        wide: true,
        fields: [
          textField("Метка", "host.festivals.label"),
          textField("Заголовок", "host.festivals.title", "textarea"),
          textField("Описание", "host.festivals.text", "textarea"),
          arrayField(
            "host.festivals.items",
            "Фестиваль",
            [
              itemField("Название", "title"),
              itemField("Дата", "date"),
              itemField("Статус", "status"),
              itemField("Описание", "text", "textarea"),
              itemField("Фото", "image", "image"),
              itemField("Ссылка на источник", "sourceUrl"),
              itemField("Текст ссылки", "sourceLabel"),
            ],
            {
              title: "Новое событие",
              date: "Дата уточняется",
              status: "Анонс",
              text: "Описание события.",
              image: "assets/warm-table.png",
              sourceUrl: "",
              sourceLabel: "Подробнее",
            }
          ),
        ],
      },
    ],
  },
  {
    id: "location",
    label: "Отдых",
    title: "Ретриты, группы и активности",
    blocks: [
      {
        title: "Первый экран",
        fields: [
          textField("Фото", "location.hero.image", "image"),
          textField("Рукописная строка", "location.hero.script"),
          textField("Заголовок", "location.hero.title", "textarea"),
          textField("Описание", "location.hero.text", "textarea"),
        ],
      },
      {
        title: "Для ретритов и групп",
        fields: [
          textField("Фото", "location.groups.image", "image"),
          textField("Метка", "location.groups.label"),
          textField("Заголовок", "location.groups.title", "textarea"),
          textField("Описание", "location.groups.text", "textarea"),
          textField("Что можно организовать", "location.groups.organize", "list"),
        ],
      },
      {
        title: "Кому подходит",
        wide: true,
        fields: [
          arrayField(
            "location.groups.audiences",
            "Формат",
            [itemField("Название", "title"), itemField("Описание", "text", "textarea")],
            { title: "Новый формат", text: "Для кого и зачем." }
          ),
        ],
      },
      {
        title: "Экскурсии и активности",
        wide: true,
        fields: [
          textField("Метка", "location.activities.label"),
          textField("Заголовок", "location.activities.title", "textarea"),
          textField("Описание", "location.activities.text", "textarea"),
          arrayField(
            "location.activities.items",
            "Активность",
            [
              itemField("Номер", "number"),
              itemField("Название", "title"),
              itemField("Короткая пометка", "meta"),
              itemField("Описание", "text", "textarea"),
            ],
            { number: "06", title: "Новая активность", meta: "по договоренности", text: "Описание активности." }
          ),
        ],
      },
      {
        title: "Помощь с организацией",
        wide: true,
        fields: [
          textField("Заголовок", "location.guide.title", "textarea"),
          textField("Описание", "location.guide.text", "textarea"),
          arrayField(
            "location.guide.items",
            "Этап",
            [itemField("Метка", "label"), itemField("Название", "title"), itemField("Описание", "text", "textarea")],
            { label: "Этап", title: "Новый пункт", text: "Описание помощи." }
          ),
        ],
      },
    ],
  },
  {
    id: "reviews",
    label: "Отзывы",
    title: "Реальные отзывы гостей",
    blocks: [
      {
        title: "Заголовок слайдера",
        fields: [
          textField("Метка", "reviews.label"),
          textField("Заголовок", "reviews.title", "textarea"),
        ],
      },
      {
        title: "Отзывы",
        wide: true,
        fields: [
          arrayField(
            "reviews.items",
            "Отзыв",
            [
              itemField("Имя", "name"),
              itemField("Дата или формат поездки", "meta"),
              itemField("Текст", "text", "textarea"),
              itemField("Источник", "source"),
              itemField("Ссылка на источник", "sourceUrl"),
            ],
            { name: "Новый гость", meta: "дата", text: "Текст отзыва.", source: "Источник", sourceUrl: "" }
          ),
        ],
      },
    ],
  },
  {
    id: "booking",
    label: "Бронь",
    title: "Контакты и бронирование",
    blocks: [
      {
        title: "Первый экран",
        fields: [
          textField("Рукописная строка", "booking.hero.script"),
          textField("Заголовок", "booking.hero.title", "textarea"),
          textField("Описание", "booking.hero.text", "textarea"),
        ],
      },
      {
        title: "Прямой контакт",
        fields: [
          textField("Метка", "booking.contact.label"),
          textField("Заголовок", "booking.contact.title", "textarea"),
          textField("Описание", "booking.contact.text", "textarea"),
        ],
      },
      {
        title: "Как забронировать",
        wide: true,
        fields: [
          textField("Заголовок", "booking.process.title"),
          textField("Описание", "booking.process.text", "textarea"),
          arrayField(
            "booking.process.steps",
            "Шаг",
            [itemField("Название", "title"), itemField("Описание", "text", "textarea")],
            { title: "Новый шаг", text: "Описание шага." }
          ),
        ],
      },
      {
        title: "Частые вопросы",
        wide: true,
        fields: [
          textField("Заголовок", "booking.faq.title"),
          textField("Описание", "booking.faq.text", "textarea"),
          arrayField(
            "booking.faq.items",
            "Вопрос",
            [itemField("Вопрос", "question"), itemField("Ответ", "answer", "textarea")],
            { question: "Новый вопрос?", answer: "Ответ." }
          ),
        ],
      },
      {
        title: "Финальный блок Катерины",
        fields: [
          textField("Фото", "booking.hostNote.image", "image"),
          textField("Метка", "booking.hostNote.label"),
          textField("Заголовок", "booking.hostNote.title", "textarea"),
        ],
      },
    ],
  },
  {
    id: "site",
    label: "Настройки",
    title: "Контакты, оплата и подвал",
    blocks: [
      {
        title: "Название",
        fields: [
          textField("Короткое название", "site.brandShort"),
          textField("Полное название", "site.brandFull"),
          textField("Подпись под логотипом", "site.tagline"),
        ],
      },
      {
        title: "Контакты",
        fields: [
          textField("Телефон без пробелов", "site.phone"),
          textField("Телефон для показа", "site.phoneDisplay"),
          textField("Ссылка WhatsApp", "site.whatsapp"),
          textField("Ссылка Telegram", "site.telegram"),
          textField("Адрес", "site.address", "textarea"),
        ],
      },
      {
        title: "Карта",
        fields: [
          textField("Ссылка на большую карту", "site.mapLink", "textarea"),
          textField("Ссылка для встраивания карты", "site.mapEmbed", "textarea"),
        ],
      },
      {
        title: "Оплата и политика",
        wide: true,
        fields: [
          textField("Способы оплаты", "site.payment", "textarea"),
          textField("Название политики", "site.policyTitle"),
          textField("Текст политики", "site.policyText", "textarea"),
        ],
      },
      {
        title: "Подписи в подвале",
        wide: true,
        fields: [
          textField("Главная", "site.footerHome", "textarea"),
          textField("Комнаты", "site.footerRooms", "textarea"),
          textField("Катерина", "site.footerHost", "textarea"),
          textField("Отдых", "site.footerLocation", "textarea"),
          textField("Бронирование", "site.footerBooking", "textarea"),
        ],
      },
    ],
  },
];

const getByPath = (object, path) =>
  path.split(".").reduce((value, key) => (value == null ? undefined : value[key]), object);

const setByPath = (object, path, value) => {
  const keys = path.split(".");
  const lastKey = keys.pop();
  const parent = keys.reduce((target, key) => {
    if (target[key] == null || typeof target[key] !== "object") target[key] = {};
    return target[key];
  }, object);
  parent[lastKey] = value;
};

const setStatus = (message, tone = "neutral") => {
  statusBar.textContent = message;
  statusBar.dataset.tone = tone;
};

const createField = (field, path) => {
  const label = document.createElement("label");
  label.className = "field";
  const caption = document.createElement("span");
  caption.textContent = field.label;
  label.append(caption);

  const isTextarea = field.type === "textarea" || field.type === "list";
  const input = document.createElement(isTextarea ? "textarea" : "input");
  const value = getByPath(content, path);
  input.value = field.type === "list" ? (Array.isArray(value) ? value.join("\n") : "") : value || "";
  if (!isTextarea) input.type = "text";
  if (isTextarea) input.rows = field.type === "list" ? 6 : 4;

  input.addEventListener("input", () => {
    const nextValue = field.type === "list" ? input.value.split("\n").map((item) => item.trim()).filter(Boolean) : input.value;
    setByPath(content, path, nextValue);
    if (field.type === "image") {
      const preview = label.querySelector("img");
      if (preview) preview.src = input.value;
    }
    setStatus("Есть несохраненные изменения.", "neutral");
  });

  if (field.type === "image") {
    const wrap = document.createElement("div");
    wrap.className = "image-preview";
    const image = document.createElement("img");
    image.src = input.value;
    image.alt = "Предпросмотр";
    image.addEventListener("error", () => image.classList.add("is-broken"));
    image.addEventListener("load", () => image.classList.remove("is-broken"));
    wrap.append(image, input);
    label.append(wrap);
    const hint = document.createElement("p");
    hint.className = "field-hint";
    hint.textContent = "Укажите путь из папки assets или прямую https-ссылку на фотографию.";
    label.append(hint);
    return label;
  }

  label.append(input);
  return label;
};

const createArrayField = (field) => {
  const wrapper = document.createElement("div");
  wrapper.className = "array-wrapper";
  const group = document.createElement("div");
  group.className = "array-group";
  const items = getByPath(content, field.path) || [];

  items.forEach((item, index) => {
    const itemCard = document.createElement("div");
    itemCard.className = "array-item";
    const top = document.createElement("div");
    top.className = "array-item-top";
    const title = document.createElement("p");
    title.className = "array-item-title";
    title.textContent = `${field.itemLabel} ${index + 1}`;
    const removeButton = document.createElement("button");
    removeButton.className = "mini-button";
    removeButton.type = "button";
    removeButton.textContent = "Удалить";
    removeButton.addEventListener("click", () => {
      const current = getByPath(content, field.path) || [];
      current.splice(index, 1);
      setByPath(content, field.path, current);
      setStatus("Элемент удален. Сохраните изменения.", "neutral");
      render();
    });
    top.append(title, removeButton);
    itemCard.append(top);

    const stack = document.createElement("div");
    stack.className = "field-stack";
    field.fields.forEach((itemConfig) => {
      stack.append(createField(itemConfig, `${field.path}.${index}.${itemConfig.key}`));
    });
    itemCard.append(stack);
    group.append(itemCard);
  });

  const addButton = document.createElement("button");
  addButton.className = "ghost-button add-button";
  addButton.type = "button";
  addButton.textContent = `Добавить: ${field.itemLabel.toLowerCase()}`;
  addButton.addEventListener("click", () => {
    const current = getByPath(content, field.path) || [];
    current.push({ ...field.template });
    setByPath(content, field.path, current);
    setStatus("Новый элемент добавлен. Заполните его и сохраните.", "neutral");
    render();
  });
  wrapper.append(group, addButton);
  return wrapper;
};

const renderNav = () => {
  nav.innerHTML = "";
  pageConfig.forEach((pageItem, index) => {
    const button = document.createElement("button");
    button.className = `nav-button${pageItem.id === activePage ? " is-active" : ""}`;
    button.type = "button";
    const label = document.createElement("span");
    label.textContent = pageItem.label;
    const number = document.createElement("small");
    number.textContent = String(index + 1).padStart(2, "0");
    button.append(label, number);
    button.addEventListener("click", () => {
      activePage = pageItem.id;
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    nav.append(button);
  });
};

const renderEditor = () => {
  const pageItem = pageConfig.find((item) => item.id === activePage) || pageConfig[0];
  pageTitle.textContent = pageItem.title;
  editorGrid.innerHTML = "";
  pageItem.blocks.forEach((block, index) => {
    const card = document.createElement("article");
    card.className = `editor-card${block.wide ? " is-wide" : ""}`;
    card.style.setProperty("--delay", `${index * 50}ms`);
    const title = document.createElement("h2");
    title.textContent = block.title;
    card.append(title);
    const stack = document.createElement("div");
    stack.className = "field-stack";
    block.fields.forEach((field) => {
      stack.append(field.type === "array" ? createArrayField(field) : createField(field, field.path));
    });
    card.append(stack);
    editorGrid.append(card);
  });
};

const render = () => {
  renderNav();
  renderEditor();
};

const loadContent = async () => {
  const response = await fetch("/api/admin/content", {
    headers: { "x-admin-password": adminPassword },
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) throw new Error(result.error || "Не удалось загрузить контент");
  content = result.content;
  render();
  loginLayer.classList.add("is-hidden");
  setStatus("Контент загружен. Все новые блоки, фотографии, комнаты, события и отзывы доступны по разделам.", "success");
};

const saveContent = async () => {
  if (!content) return;
  saveButton.disabled = true;
  setStatus("Сохраняю изменения...");
  try {
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": adminPassword },
      body: JSON.stringify({ content }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) throw new Error(result.error || "Не удалось сохранить контент");
    setStatus("Готово. Изменения уже доступны на сайте.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    saveButton.disabled = false;
  }
};

const exportContent = () => {
  if (!content) return;
  const blob = new Blob([`${JSON.stringify(content, null, 2)}\n`], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `maori-content-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  setStatus("Резервная копия JSON скачана.", "success");
};

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  adminPassword = passwordInput.value.trim();
  loginError.textContent = "";
  try {
    await loadContent();
    sessionStorage.setItem("maoriAdminPassword", adminPassword);
  } catch (error) {
    loginError.textContent =
      error.message === "ADMIN_PASSWORD is not configured"
        ? "В Railway добавьте переменную ADMIN_PASSWORD и перезапустите деплой."
        : "Пароль не подошел или сервер не ответил.";
  }
});

saveButton.addEventListener("click", saveContent);
exportButton.addEventListener("click", exportContent);

if (adminPassword) {
  loadContent().catch(() => {
    sessionStorage.removeItem("maoriAdminPassword");
    loginLayer.classList.remove("is-hidden");
  });
}
