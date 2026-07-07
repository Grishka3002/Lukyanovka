const header = document.querySelector(".site-header");
const bookingForm = document.querySelector("#bookingForm");
const houseSelect = document.querySelector("#houseSelect");
const dialog = document.querySelector("#bookingDialog");
const dialogText = document.querySelector("#dialogText");
const dialogClose = document.querySelector(".dialog-close");
const dialogOk = document.querySelector("#dialogOk");
const formStatus = document.querySelector("#formStatus");

document.documentElement.classList.add("motion-ready");

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const dayAfter = new Date(today);
dayAfter.setDate(today.getDate() + 2);

const toDateInputValue = (date) => date.toISOString().slice(0, 10);

const setInitialDates = () => {
  document.querySelectorAll('input[type="date"]').forEach((input) => {
    input.min = toDateInputValue(today);
  });

  document.querySelectorAll('input[name="checkin"]').forEach((input) => {
    if (!input.value) input.value = toDateInputValue(tomorrow);
  });

  document.querySelectorAll('input[name="checkout"]').forEach((input) => {
    if (!input.value) input.value = toDateInputValue(dayAfter);
  });
};

const formatDate = (value) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
  }).format(new Date(value));

const ensureCheckoutAfterCheckin = (form) => {
  const checkin = form?.elements?.checkin;
  const checkout = form?.elements?.checkout;
  if (!checkin || !checkout || !checkin.value) return;

  const minCheckout = new Date(checkin.value);
  minCheckout.setDate(minCheckout.getDate() + 1);
  checkout.min = toDateInputValue(minCheckout);

  if (!checkout.value || new Date(checkout.value) <= new Date(checkin.value)) {
    checkout.value = toDateInputValue(minCheckout);
  }
};

const applyRoomFromUrl = () => {
  if (!houseSelect) return;
  const room = new URLSearchParams(window.location.search).get("room");
  if (!room) return;

  const option = [...houseSelect.options].find((item) => item.value === room || item.textContent === room);
  if (option) houseSelect.value = option.value;
};

const setFormStatus = (message, tone = "neutral") => {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.dataset.tone = tone;
};

const openDialog = (data, delivery) => {
  if (!dialog || !dialogText) return;

  const nights = Math.max(
    1,
    Math.round((new Date(data.checkout) - new Date(data.checkin)) / 86_400_000)
  );
  const intro = data.name ? `${data.name}, заявка собрана.` : "Заявка собрана.";
  const deliveryText = delivery?.delivered
    ? "Заявка отправлена Катерине."
    : "Заявка показана на сайте; для реальной отправки нужно подключить Telegram в Railway.";
  dialogText.textContent = `${intro} ${formatDate(data.checkin)} - ${formatDate(data.checkout)}, ${nights} ноч., ${data.guests.toLowerCase()}, комната: ${data.house}. ${deliveryText}`;

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
    document.body.classList.add("dialog-open");
  } else {
    alert(dialogText.textContent);
  }
};

const closeDialog = () => {
  dialog?.close();
  document.body.classList.remove("dialog-open");
};

window.addEventListener("scroll", () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 20);
});

const setupRevealAnimations = () => {
  const revealElements = document.querySelectorAll(
    ".reveal, .editorial-intro > *, .chapter-card, .room-row, .value-card"
  );

  revealElements.forEach((element, index) => {
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay", `${Math.min((index % 4) * 85, 255)}ms`);
  });

  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.12,
    }
  );

  revealElements.forEach((element) => observer.observe(element));
};

const getContentValue = (object, path) =>
  path.split(".").reduce((value, key) => (value == null ? undefined : value[key]), object);

const setTextContent = (selector, content, path) => {
  const element = document.querySelector(selector);
  const value = getContentValue(content, path);
  if (element && typeof value === "string") element.textContent = value;
};

const setImageSource = (selector, content, path) => {
  const element = document.querySelector(selector);
  const value = getContentValue(content, path);
  if (element && typeof value === "string" && value.trim()) element.src = value;
};

const setListItems = (container, items) => {
  if (!container || !Array.isArray(items)) return;
  container.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    container.append(li);
  });
};

const renderCardArray = (selector, items, renderer) => {
  const elements = document.querySelectorAll(selector);
  if (!Array.isArray(items)) return;
  elements.forEach((element, index) => {
    if (items[index]) renderer(element, items[index], index);
  });
};

const applySiteContent = (content) => {
  const page = document.body.dataset.page;
  document.querySelectorAll("header .brand span:last-child").forEach((element) => {
    if (content.site?.brandShort) element.textContent = content.site.brandShort;
  });
  document.querySelectorAll("footer .brand span:last-child").forEach((element) => {
    if (content.site?.brandFull) element.textContent = content.site.brandFull;
  });

  const footerMap = {
    home: "site.footerHome",
    rooms: "site.footerRooms",
    host: "site.footerHost",
    location: "site.footerLocation",
    booking: "site.footerBooking",
  };
  setTextContent("footer > span", content, footerMap[page] || "site.footerHome");

  if (houseSelect && Array.isArray(content.rooms?.rooms)) {
    const selectedRoom = new URLSearchParams(window.location.search).get("room") || houseSelect.value;
    houseSelect.innerHTML = "";
    content.rooms.rooms.forEach((room) => {
      const option = document.createElement("option");
      option.value = room.title;
      option.textContent = room.title;
      houseSelect.append(option);
    });

    const helpOption = document.createElement("option");
    helpOption.value = "Помогите выбрать";
    helpOption.textContent = "Помогите выбрать";
    houseSelect.append(helpOption);

    const option = [...houseSelect.options].find((item) => item.value === selectedRoom || item.textContent === selectedRoom);
    if (option) houseSelect.value = option.value;
  }
};

const applyHomeContent = (content) => {
  setImageSource(".home-hero .hero-image", content, "home.hero.image");
  setTextContent(".home-hero .hero-copy-block .script-word", content, "home.hero.script");
  setTextContent(".home-hero .hero-copy-block h1", content, "home.hero.title");
  setTextContent(".home-hero .hero-copy-block > p:nth-of-type(2)", content, "home.hero.text");
  setTextContent(".host-note span", content, "home.hostNote.label");
  setTextContent(".host-note strong", content, "home.hostNote.name");
  setTextContent(".host-note p", content, "home.hostNote.text");
  setTextContent(".editorial-intro .section-label", content, "home.intro.label");
  setTextContent(".editorial-intro h2", content, "home.intro.title");
  setTextContent(".editorial-intro p", content, "home.intro.text");
  setImageSource(".split-feature .feature-media img", content, "home.feature.image");
  setTextContent(".split-feature .feature-copy .script-word", content, "home.feature.script");
  setTextContent(".split-feature .feature-copy h2", content, "home.feature.title");
  setTextContent(".split-feature .feature-copy p:not(.script-word)", content, "home.feature.text");

  renderCardArray(".detail-grid .detail-item", content.home?.details, (element, item) => {
    element.querySelector("span").textContent = item.label;
    element.querySelector("h2").textContent = item.title;
    element.querySelector("p").textContent = item.text;
  });

  setTextContent(".arrival-flow .section-heading h2", content, "home.arrival.title");
  setTextContent(".arrival-flow .section-heading p", content, "home.arrival.text");
  renderCardArray(".arrival-flow .flow-step", content.home?.arrival?.steps, (element, item) => {
    element.querySelector("h3").textContent = item.title;
    element.querySelector("p").textContent = item.text;
  });

  setTextContent(".booking-strip:not(.dark-band) .section-label", content, "home.bookingStrip.label");
  setTextContent(".booking-strip:not(.dark-band) h2", content, "home.bookingStrip.title");
  setTextContent(".booking-strip:not(.dark-band) .button", content, "home.bookingStrip.button");
};

const applyRoomsContent = (content) => {
  setTextContent(".page-hero .script-word", content, "rooms.hero.script");
  setTextContent(".page-hero h1", content, "rooms.hero.title");
  setTextContent(".page-hero > p:not(.script-word)", content, "rooms.hero.text");
  setImageSource(".image-led .wide-photo", content, "rooms.image");

  renderCardArray(".room-list .room-row", content.rooms?.rooms, (element, item) => {
    element.querySelector("h2").textContent = item.title;
    element.querySelector("p").textContent = item.text;
    setListItems(element.querySelector(".room-facts"), String(item.facts || "").split(",").map((fact) => fact.trim()).filter(Boolean));
    const link = element.querySelector("a");
    if (link) link.href = `booking.html?room=${encodeURIComponent(item.title)}`;
  });

  setTextContent(".room-notes .section-heading h2", content, "rooms.notes.title");
  setTextContent(".room-notes .section-heading p", content, "rooms.notes.text");
  renderCardArray(".room-notes .note-card", content.rooms?.notes?.items, (element, item) => {
    element.querySelector("h3").textContent = item.title;
    element.querySelector("p").textContent = item.text;
  });

  setTextContent(".booking-strip.dark-band .section-label", content, "rooms.bookingStrip.label");
  setTextContent(".booking-strip.dark-band h2", content, "rooms.bookingStrip.title");
  setTextContent(".booking-strip.dark-band .button", content, "rooms.bookingStrip.button");
};

const applyHostContent = (content) => {
  setTextContent(".host-title .script-word", content, "host.hero.script");
  setTextContent(".host-title h1", content, "host.hero.title");
  setTextContent(".host-statement p", content, "host.hero.text");
  setImageSource(".host-visual img", content, "host.hero.image");
  setImageSource(".split-feature .feature-media img", content, "host.feature.image");
  setTextContent(".split-feature .feature-copy .section-label", content, "host.feature.label");
  setTextContent(".split-feature .feature-copy h2", content, "host.feature.title");
  setTextContent(".split-feature .feature-copy p:nth-of-type(2)", content, "host.feature.text");
  setTextContent(".split-feature .feature-copy p:nth-of-type(3)", content, "host.feature.extra");
  setTextContent(".letter-card .script-word", content, "host.letter.script");
  setTextContent(".letter-card blockquote", content, "host.letter.quote");
  setTextContent(".letter-card > span", content, "host.letter.signature");
  setTextContent(".host-help h2", content, "host.help.title");
  setListItems(document.querySelector(".host-help .clean-list"), content.host?.help?.items);

  renderCardArray(".values .value-card", content.host?.values, (element, item) => {
    element.querySelector("h2").textContent = item.title;
    element.querySelector("p").textContent = item.text;
  });
};

const applyLocationContent = (content) => {
  setTextContent(".page-hero .script-word", content, "location.hero.script");
  setTextContent(".page-hero h1", content, "location.hero.title");
  setTextContent(".page-hero > p:not(.script-word)", content, "location.hero.text");

  renderCardArray(".route-list .room-row", content.location?.routes, (element, item) => {
    element.querySelector("h2").textContent = item.title;
    element.querySelector("p").textContent = item.text;
  });

  setTextContent(".place-guide .section-heading h2", content, "location.guide.title");
  setTextContent(".place-guide .section-heading p", content, "location.guide.text");
  renderCardArray(".place-guide .guide-card", content.location?.guide?.items, (element, item) => {
    element.querySelector("span").textContent = item.label;
    element.querySelector("h3").textContent = item.title;
    element.querySelector("p").textContent = item.text;
  });
};

const applyBookingContent = (content) => {
  setTextContent(".booking-intro .script-word", content, "booking.hero.script");
  setTextContent(".booking-intro h1", content, "booking.hero.title");
  setTextContent(".booking-intro > p:not(.script-word)", content, "booking.hero.text");
  setTextContent(".booking-process .section-heading h2", content, "booking.process.title");
  setTextContent(".booking-process .section-heading p", content, "booking.process.text");
  renderCardArray(".booking-process .flow-step", content.booking?.process?.steps, (element, item) => {
    element.querySelector("h3").textContent = item.title;
    element.querySelector("p").textContent = item.text;
  });

  setTextContent(".faq-section .section-heading h2", content, "booking.faq.title");
  setTextContent(".faq-section .section-heading p", content, "booking.faq.text");
  renderCardArray(".faq-section .faq-item", content.booking?.faq?.items, (element, item) => {
    element.querySelector("summary").textContent = item.question;
    element.querySelector("p").textContent = item.answer;
  });

  setImageSource(".host-booking-note img", content, "booking.hostNote.image");
  setTextContent(".host-booking-note .section-label", content, "booking.hostNote.label");
  setTextContent(".host-booking-note h2", content, "booking.hostNote.title");
};

const applyEditableContent = (content) => {
  const page = document.body.dataset.page;
  applySiteContent(content);

  const pageRenderers = {
    home: applyHomeContent,
    rooms: applyRoomsContent,
    host: applyHostContent,
    location: applyLocationContent,
    booking: applyBookingContent,
  };

  pageRenderers[page]?.(content);
};

const loadEditableContent = async () => {
  try {
    const response = await fetch("/api/content", { cache: "no-store" });
    const result = await response.json();
    if (response.ok && result.ok) applyEditableContent(result.content);
  } catch (error) {
    console.warn("Editable content is unavailable", error);
  }
};

document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("change", (event) => {
    if (event.target.matches('input[name="checkin"]')) {
      ensureCheckoutAfterCheckin(form);
    }
  });
});

bookingForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  ensureCheckoutAfterCheckin(bookingForm);

  const formData = Object.fromEntries(new FormData(bookingForm).entries());
  const submitButton = bookingForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  setFormStatus("Отправляем заявку...", "neutral");

  try {
    const response = await fetch("/api/booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.error || "Не удалось отправить заявку");
    }

    setFormStatus(
      result.delivered
        ? "Заявка отправлена Катерине."
        : "Заявка собрана. Telegram-отправка пока не подключена в Railway.",
      result.delivered ? "success" : "neutral"
    );
    openDialog(formData, result);
    bookingForm.reset();
    setInitialDates();
    applyRoomFromUrl();
  } catch (error) {
    setFormStatus("Не получилось отправить автоматически. Проверьте связь или попробуйте позже.", "error");
    openDialog(formData, { delivered: false });
  } finally {
    submitButton.disabled = false;
  }
});

dialogClose?.addEventListener("click", closeDialog);
dialogOk?.addEventListener("click", closeDialog);
dialog?.addEventListener("close", () => document.body.classList.remove("dialog-open"));

loadEditableContent();
setInitialDates();
ensureCheckoutAfterCheckin(bookingForm);
applyRoomFromUrl();
setupRevealAnimations();
