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

const pageConfig = [
  {
    id: "home",
    label: "Главная",
    title: "Главная страница",
    blocks: [
      {
        title: "Первый экран",
        fields: [
          { label: "Рукописная подпись", path: "home.hero.script" },
          { label: "Заголовок", path: "home.hero.title", type: "textarea" },
          { label: "Текст", path: "home.hero.text", type: "textarea" },
          { label: "Фото первого экрана", path: "home.hero.image", type: "image" }
        ]
      },
      {
        title: "Заметка про хозяйку",
        fields: [
          { label: "Маленький заголовок", path: "home.hostNote.label" },
          { label: "Имя", path: "home.hostNote.name" },
          { label: "Текст", path: "home.hostNote.text", type: "textarea" }
        ]
      },
      {
        title: "Вступление",
        fields: [
          { label: "Метка", path: "home.intro.label" },
          { label: "Заголовок", path: "home.intro.title", type: "textarea" },
          { label: "Текст", path: "home.intro.text", type: "textarea" }
        ]
      },
      {
        title: "Блок с фотографией",
        fields: [
          { label: "Фото", path: "home.feature.image", type: "image" },
          { label: "Рукописная подпись", path: "home.feature.script" },
          { label: "Заголовок", path: "home.feature.title", type: "textarea" },
          { label: "Текст", path: "home.feature.text", type: "textarea" }
        ]
      },
      {
        title: "Три преимущества",
        wide: true,
        fields: [
          {
            type: "array",
            path: "home.details",
            itemLabel: "Карточка",
            fields: [
              { label: "Метка", key: "label" },
              { label: "Заголовок", key: "title" },
              { label: "Текст", key: "text", type: "textarea" }
            ]
          }
        ]
      },
      {
        title: "Как проходит приезд",
        wide: true,
        fields: [
          { label: "Заголовок", path: "home.arrival.title" },
          { label: "Текст", path: "home.arrival.text", type: "textarea" },
          {
            type: "array",
            path: "home.arrival.steps",
            itemLabel: "Шаг",
            fields: [
              { label: "Заголовок", key: "title" },
              { label: "Текст", key: "text", type: "textarea" }
            ]
          }
        ]
      },
      {
        title: "Нижний призыв",
        fields: [
          { label: "Метка", path: "home.bookingStrip.label" },
          { label: "Заголовок", path: "home.bookingStrip.title", type: "textarea" },
          { label: "Кнопка", path: "home.bookingStrip.button" }
        ]
      }
    ]
  },
  {
    id: "rooms",
    label: "Комнаты",
    title: "Страница комнат",
    blocks: [
      {
        title: "Первый экран",
        fields: [
          { label: "Рукописная подпись", path: "rooms.hero.script" },
          { label: "Заголовок", path: "rooms.hero.title", type: "textarea" },
          { label: "Текст", path: "rooms.hero.text", type: "textarea" },
          { label: "Фото комнат", path: "rooms.image", type: "image" }
        ]
      },
      {
        title: "Комнаты",
        wide: true,
        fields: [
          {
            type: "array",
            path: "rooms.rooms",
            itemLabel: "Комната",
            fields: [
              { label: "Название", key: "title" },
              { label: "Описание", key: "text", type: "textarea" },
              { label: "Факты через запятую", key: "facts", type: "textarea" }
            ]
          }
        ]
      },
      {
        title: "Что уточнить",
        wide: true,
        fields: [
          { label: "Заголовок", path: "rooms.notes.title" },
          { label: "Текст", path: "rooms.notes.text", type: "textarea" },
          {
            type: "array",
            path: "rooms.notes.items",
            itemLabel: "Пункт",
            fields: [
              { label: "Заголовок", key: "title" },
              { label: "Текст", key: "text", type: "textarea" }
            ]
          }
        ]
      },
      {
        title: "Нижний призыв",
        fields: [
          { label: "Метка", path: "rooms.bookingStrip.label" },
          { label: "Заголовок", path: "rooms.bookingStrip.title", type: "textarea" },
          { label: "Кнопка", path: "rooms.bookingStrip.button" }
        ]
      }
    ]
  },
  {
    id: "host",
    label: "Хозяйка",
    title: "Страница хозяйки",
    blocks: [
      {
        title: "Катерина",
        fields: [
          { label: "Рукописная подпись", path: "host.hero.script" },
          { label: "Имя / заголовок", path: "host.hero.title" },
          { label: "Текст", path: "host.hero.text", type: "textarea" },
          { label: "Фото", path: "host.hero.image", type: "image" }
        ]
      },
      {
        title: "Смысл Маори",
        fields: [
          { label: "Фото", path: "host.feature.image", type: "image" },
          { label: "Метка", path: "host.feature.label" },
          { label: "Заголовок", path: "host.feature.title", type: "textarea" },
          { label: "Текст 1", path: "host.feature.text", type: "textarea" },
          { label: "Текст 2", path: "host.feature.extra", type: "textarea" }
        ]
      },
      {
        title: "Записка хозяйки",
        fields: [
          { label: "Рукописная подпись", path: "host.letter.script" },
          { label: "Цитата", path: "host.letter.quote", type: "textarea" },
          { label: "Подпись", path: "host.letter.signature" }
        ]
      },
      {
        title: "Помощь до приезда",
        wide: true,
        fields: [
          { label: "Заголовок", path: "host.help.title", type: "textarea" },
          { label: "Пункты списком", path: "host.help.items", type: "list" }
        ]
      },
      {
        title: "Ценности",
        wide: true,
        fields: [
          {
            type: "array",
            path: "host.values",
            itemLabel: "Ценность",
            fields: [
              { label: "Заголовок", key: "title" },
              { label: "Текст", key: "text", type: "textarea" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "location",
    label: "Место",
    title: "Страница места",
    blocks: [
      {
        title: "Первый экран",
        fields: [
          { label: "Рукописная подпись", path: "location.hero.script" },
          { label: "Заголовок", path: "location.hero.title", type: "textarea" },
          { label: "Текст", path: "location.hero.text", type: "textarea" }
        ]
      },
      {
        title: "Маршруты рядом",
        wide: true,
        fields: [
          {
            type: "array",
            path: "location.routes",
            itemLabel: "Маршрут",
            fields: [
              { label: "Заголовок", key: "title" },
              { label: "Текст", key: "text", type: "textarea" }
            ]
          }
        ]
      },
      {
        title: "Перед поездкой",
        wide: true,
        fields: [
          { label: "Заголовок", path: "location.guide.title" },
          { label: "Текст", path: "location.guide.text", type: "textarea" },
          {
            type: "array",
            path: "location.guide.items",
            itemLabel: "Карточка",
            fields: [
              { label: "Метка", key: "label" },
              { label: "Заголовок", key: "title" },
              { label: "Текст", key: "text", type: "textarea" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "booking",
    label: "Бронь",
    title: "Страница бронирования",
    blocks: [
      {
        title: "Первый экран",
        fields: [
          { label: "Рукописная подпись", path: "booking.hero.script" },
          { label: "Заголовок", path: "booking.hero.title", type: "textarea" },
          { label: "Текст", path: "booking.hero.text", type: "textarea" }
        ]
      },
      {
        title: "После заявки",
        wide: true,
        fields: [
          { label: "Заголовок", path: "booking.process.title" },
          { label: "Текст", path: "booking.process.text", type: "textarea" },
          {
            type: "array",
            path: "booking.process.steps",
            itemLabel: "Шаг",
            fields: [
              { label: "Заголовок", key: "title" },
              { label: "Текст", key: "text", type: "textarea" }
            ]
          }
        ]
      },
      {
        title: "FAQ",
        wide: true,
        fields: [
          { label: "Заголовок", path: "booking.faq.title" },
          { label: "Текст", path: "booking.faq.text", type: "textarea" },
          {
            type: "array",
            path: "booking.faq.items",
            itemLabel: "Вопрос",
            fields: [
              { label: "Вопрос", key: "question" },
              { label: "Ответ", key: "answer", type: "textarea" }
            ]
          }
        ]
      },
      {
        title: "Заметка снизу",
        fields: [
          { label: "Фото", path: "booking.hostNote.image", type: "image" },
          { label: "Метка", path: "booking.hostNote.label" },
          { label: "Заголовок", path: "booking.hostNote.title", type: "textarea" }
        ]
      }
    ]
  },
  {
    id: "site",
    label: "Настройки",
    title: "Общие настройки",
    blocks: [
      {
        title: "Название и подвал",
        wide: true,
        fields: [
          { label: "Короткое название", path: "site.brandShort" },
          { label: "Полное название", path: "site.brandFull" },
          { label: "Подвал главной", path: "site.footerHome", type: "textarea" },
          { label: "Подвал комнат", path: "site.footerRooms", type: "textarea" },
          { label: "Подвал хозяйки", path: "site.footerHost", type: "textarea" },
          { label: "Подвал места", path: "site.footerLocation", type: "textarea" },
          { label: "Подвал брони", path: "site.footerBooking", type: "textarea" }
        ]
      }
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
  input.value = field.type === "list" ? (getByPath(content, path) || []).join("\n") : getByPath(content, path) || "";
  if (!isTextarea) input.type = "text";
  if (isTextarea) input.rows = field.type === "list" ? 5 : 4;

  input.addEventListener("input", () => {
    const value = field.type === "list" ? input.value.split("\n").filter(Boolean) : input.value;
    setByPath(content, path, value);

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
  const group = document.createElement("div");
  group.className = "array-group";
  const items = getByPath(content, field.path) || [];

  items.forEach((item, index) => {
    const itemCard = document.createElement("div");
    itemCard.className = "array-item";

    const title = document.createElement("p");
    title.className = "array-item-title";
    title.textContent = `${field.itemLabel} ${index + 1}`;
    itemCard.append(title);

    const stack = document.createElement("div");
    stack.className = "field-stack";

    field.fields.forEach((itemField) => {
      stack.append(createField(itemField, `${field.path}.${index}.${itemField.key}`));
    });

    itemCard.append(stack);
    group.append(itemCard);
  });

  return group;
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
      if (field.type === "array") {
        stack.append(createArrayField(field));
        return;
      }

      stack.append(createField(field, field.path));
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
    cache: "no-store"
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.ok) {
    throw new Error(result.error || "Не удалось загрузить контент");
  }

  content = result.content;
  render();
  loginLayer.classList.add("is-hidden");
  setStatus("Контент загружен. Можно редактировать блоки и сохранять изменения.", "success");
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
        "x-admin-password": adminPassword
      },
      body: JSON.stringify({ content })
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.ok) {
      throw new Error(result.error || "Не удалось сохранить контент");
    }

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
    if (error.message === "ADMIN_PASSWORD is not configured") {
      loginError.textContent = "В Railway нужно добавить переменную ADMIN_PASSWORD и перезапустить деплой.";
      return;
    }

    loginError.textContent = "Пароль не подошел или сервер не ответил.";
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
