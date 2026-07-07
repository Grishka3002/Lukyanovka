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
      { title: "Первый экран", fields: [
        textField("Рукописная подпись", "home.hero.script"),
        textField("Заголовок", "home.hero.title", "textarea"),
        textField("Текст", "home.hero.text", "textarea"),
        textField("Фото первого экрана", "home.hero.image", "image")
      ] },
      { title: "Заметка про хозяйку", fields: [
        textField("Маленький заголовок", "home.hostNote.label"),
        textField("Имя", "home.hostNote.name"),
        textField("Текст", "home.hostNote.text", "textarea")
      ] },
      { title: "Вступление", fields: [
        textField("Метка", "home.intro.label"),
        textField("Заголовок", "home.intro.title", "textarea"),
        textField("Текст", "home.intro.text", "textarea")
      ] },
      { title: "Блок с фотографией", fields: [
        textField("Фото", "home.feature.image", "image"),
        textField("Рукописная подпись", "home.feature.script"),
        textField("Заголовок", "home.feature.title", "textarea"),
        textField("Текст", "home.feature.text", "textarea")
      ] },
      { title: "Преимущества", wide: true, fields: [
        arrayField("home.details", "Карточка", [
          itemField("Метка", "label"),
          itemField("Заголовок", "title"),
          itemField("Текст", "text", "textarea")
        ], { label: "Новое", title: "Новый блок", text: "Описание блока." })
      ] },
      { title: "Как проходит приезд", wide: true, fields: [
        textField("Заголовок", "home.arrival.title"),
        textField("Текст", "home.arrival.text", "textarea"),
        arrayField("home.arrival.steps", "Шаг", [
          itemField("Заголовок", "title"),
          itemField("Текст", "text", "textarea")
        ], { title: "Новый шаг", text: "Описание шага." })
      ] },
      { title: "Нижний призыв", fields: [
        textField("Метка", "home.bookingStrip.label"),
        textField("Заголовок", "home.bookingStrip.title", "textarea"),
        textField("Кнопка", "home.bookingStrip.button")
      ] }
    ]
  },
  {
    id: "rooms",
    label: "Комнаты",
    title: "Страница комнат",
    blocks: [
      { title: "Первый экран", fields: [
        textField("Рукописная подпись", "rooms.hero.script"),
        textField("Заголовок", "rooms.hero.title", "textarea"),
        textField("Текст", "rooms.hero.text", "textarea"),
        textField("Фото комнат", "rooms.image", "image")
      ] },
      { title: "Комнаты", wide: true, fields: [
        arrayField("rooms.rooms", "Комната", [
          itemField("Название", "title"),
          itemField("Описание", "text", "textarea"),
          itemField("Факты через запятую", "facts", "textarea")
        ], { title: "Новая комната", text: "Описание комнаты.", facts: "2 гостя, по запросу" })
      ] },
      { title: "Что уточнить", wide: true, fields: [
        textField("Заголовок", "rooms.notes.title"),
        textField("Текст", "rooms.notes.text", "textarea"),
        arrayField("rooms.notes.items", "Пункт", [
          itemField("Заголовок", "title"),
          itemField("Текст", "text", "textarea")
        ], { title: "Новый пункт", text: "Описание пункта." })
      ] },
      { title: "Нижний призыв", fields: [
        textField("Метка", "rooms.bookingStrip.label"),
        textField("Заголовок", "rooms.bookingStrip.title", "textarea"),
        textField("Кнопка", "rooms.bookingStrip.button")
      ] }
    ]
  },
  {
    id: "reviews",
    label: "Отзывы",
    title: "Отзывы гостей",
    blocks: [
      { title: "Заголовок слайдера", fields: [
        textField("Метка", "reviews.label"),
        textField("Заголовок", "reviews.title", "textarea")
      ] },
      { title: "Отзывы", wide: true, fields: [
        arrayField("reviews.items", "Отзыв", [
          itemField("Имя", "name"),
          itemField("Подпись", "meta"),
          itemField("Текст отзыва", "text", "textarea")
        ], { name: "Новый гость", meta: "поездка в Маори", text: "Текст нового отзыва." })
      ] }
    ]
  },
  {
    id: "host",
    label: "Хозяйка",
    title: "Страница хозяйки",
    blocks: [
      { title: "Катерина", fields: [
        textField("Рукописная подпись", "host.hero.script"),
        textField("Имя / заголовок", "host.hero.title"),
        textField("Текст", "host.hero.text", "textarea"),
        textField("Фото", "host.hero.image", "image")
      ] },
      { title: "Смысл Маори", fields: [
        textField("Фото", "host.feature.image", "image"),
        textField("Метка", "host.feature.label"),
        textField("Заголовок", "host.feature.title", "textarea"),
        textField("Текст 1", "host.feature.text", "textarea"),
        textField("Текст 2", "host.feature.extra", "textarea")
      ] },
      { title: "Записка хозяйки", fields: [
        textField("Рукописная подпись", "host.letter.script"),
        textField("Цитата", "host.letter.quote", "textarea"),
        textField("Подпись", "host.letter.signature")
      ] },
      { title: "Помощь до приезда", wide: true, fields: [
        textField("Заголовок", "host.help.title", "textarea"),
        textField("Пункты списком", "host.help.items", "list")
      ] },
      { title: "Ценности", wide: true, fields: [
        arrayField("host.values", "Ценность", [
          itemField("Заголовок", "title"),
          itemField("Текст", "text", "textarea")
        ], { title: "Новая ценность", text: "Описание ценности." })
      ] }
    ]
  },
  {
    id: "location",
    label: "Место",
    title: "Страница места",
    blocks: [
      { title: "Первый экран", fields: [
        textField("Рукописная подпись", "location.hero.script"),
        textField("Заголовок", "location.hero.title", "textarea"),
        textField("Текст", "location.hero.text", "textarea")
      ] },
      { title: "Маршруты рядом", wide: true, fields: [
        arrayField("location.routes", "Маршрут", [
          itemField("Заголовок", "title"),
          itemField("Текст", "text", "textarea")
        ], { title: "Новый маршрут", text: "Описание маршрута." })
      ] },
      { title: "Перед поездкой", wide: true, fields: [
        textField("Заголовок", "location.guide.title"),
        textField("Текст", "location.guide.text", "textarea"),
        arrayField("location.guide.items", "Карточка", [
          itemField("Метка", "label"),
          itemField("Заголовок", "title"),
          itemField("Текст", "text", "textarea")
        ], { label: "Новое", title: "Новая карточка", text: "Описание карточки." })
      ] }
    ]
  },
  {
    id: "booking",
    label: "Бронь",
    title: "Страница бронирования",
    blocks: [
      { title: "Первый экран", fields: [
        textField("Рукописная подпись", "booking.hero.script"),
        textField("Заголовок", "booking.hero.title", "textarea"),
        textField("Текст", "booking.hero.text", "textarea")
      ] },
      { title: "После заявки", wide: true, fields: [
        textField("Заголовок", "booking.process.title"),
        textField("Текст", "booking.process.text", "textarea"),
        arrayField("booking.process.steps", "Шаг", [
          itemField("Заголовок", "title"),
          itemField("Текст", "text", "textarea")
        ], { title: "Новый шаг", text: "Описание шага." })
      ] },
      { title: "FAQ", wide: true, fields: [
        textField("Заголовок", "booking.faq.title"),
        textField("Текст", "booking.faq.text", "textarea"),
        arrayField("booking.faq.items", "Вопрос", [
          itemField("Вопрос", "question"),
          itemField("Ответ", "answer", "textarea")
        ], { question: "Новый вопрос?", answer: "Ответ на вопрос." })
      ] },
      { title: "Заметка снизу", fields: [
        textField("Фото", "booking.hostNote.image", "image"),
        textField("Метка", "booking.hostNote.label"),
        textField("Заголовок", "booking.hostNote.title", "textarea")
      ] }
    ]
  },
  {
    id: "site",
    label: "Настройки",
    title: "Общие настройки",
    blocks: [
      { title: "Название и подвал", wide: true, fields: [
        textField("Короткое название", "site.brandShort"),
        textField("Полное название", "site.brandFull"),
        textField("Подвал главной", "site.footerHome", "textarea"),
        textField("Подвал комнат", "site.footerRooms", "textarea"),
        textField("Подвал хозяйки", "site.footerHost", "textarea"),
        textField("Подвал места", "site.footerLocation", "textarea"),
        textField("Подвал брони", "site.footerBooking", "textarea")
      ] }
    ]
  }
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
  if (isTextarea) input.rows = field.type === "list" ? 5 : 4;

  input.addEventListener("input", () => {
    const nextValue = field.type === "list" ? input.value.split("\n").filter(Boolean) : input.value;
    setByPath(content, path, nextValue);
    if (field.type === "image") {
      const preview = label.querySelector("img");
      if (preview) preview.src = input.value;
    }
  });

  if (field.type === "image") {
    const wrap = document.createElement("div");
    wrap.className = "image-preview";
    const image = document.createElement("img");
    image.src = input.value;
    image.alt = "";
    wrap.append(image, input);
    label.append(wrap);

    const hint = document.createElement("p");
    hint.className = "field-hint";
    hint.textContent = "Укажите путь к файлу в папке assets, например assets/room-interior.png.";
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
      render();
    });

    top.append(title, removeButton);
    itemCard.append(top);

    const stack = document.createElement("div");
    stack.className = "field-stack";
    field.fields.forEach((itemField) => {
      stack.append(createField(itemField, `${field.path}.${index}.${itemField.key}`));
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
    render();
  });

  wrapper.append(group, addButton);
  return wrapper;
};

const renderNav = () => {
  nav.innerHTML = "";
  pageConfig.forEach((page, index) => {
    const button = document.createElement("button");
    button.className = `nav-button${page.id === activePage ? " is-active" : ""}`;
    button.type = "button";
    button.innerHTML = `<span>${page.label}</span><small>${String(index + 1).padStart(2, "0")}</small>`;
    button.addEventListener("click", () => {
      activePage = page.id;
      render();
    });
    nav.append(button);
  });
};

const renderEditor = () => {
  const page = pageConfig.find((item) => item.id === activePage) || pageConfig[0];
  pageTitle.textContent = page.title;
  editorGrid.innerHTML = "";

  page.blocks.forEach((block, index) => {
    const card = document.createElement("article");
    card.className = `editor-card${block.wide ? " is-wide" : ""}`;
    card.style.setProperty("--delay", `${index * 60}ms`);

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
  setStatus("Контент загружен. Можно редактировать блоки, комнаты и отзывы.", "success");
};

const saveContent = async () => {
  if (!content) return;
  saveButton.disabled = true;
  setStatus("Сохраняю изменения...");

  try {
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": adminPassword,
      },
      body: JSON.stringify({ content }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) throw new Error(result.error || "Не удалось сохранить контент");
    setStatus("Готово. Изменения сохранены и уже доступны на сайте.", "success");
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
  setStatus("Экспорт JSON скачан. Его можно сохранить перед редеплоем.", "success");
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
        ? "В Railway нужно добавить переменную ADMIN_PASSWORD и перезапустить деплой."
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
