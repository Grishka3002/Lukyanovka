const page = document.body.dataset.page || "home";
let loadedContent = null;
let reviewIndex = 0;
let reviewTimer = null;

const getByPath = (object, path) =>
  path.split(".").reduce((value, key) => (value == null ? undefined : value[key]), object);

const setText = (selector, value) => {
  if (value == null) return;
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value;
  });
};

const createElement = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text != null) element.textContent = text;
  return element;
};

const bindEditableContent = (content) => {
  document.querySelectorAll("[data-bind]").forEach((element) => {
    const value = getByPath(content, element.dataset.bind);
    if (value != null) element.textContent = value;
  });

  document.querySelectorAll("[data-bind-image]").forEach((image) => {
    const value = getByPath(content, image.dataset.bindImage);
    if (value) image.src = value;
  });
};

const applySiteContent = (content) => {
  const { site = {} } = content;
  setText("[data-brand-short]", site.brandShort);
  setText("[data-site-tagline]", site.tagline);
  setText("[data-site-address]", site.address);
  setText("[data-site-payment]", site.payment);
  setText("[data-phone-link]", site.phoneDisplay);
  setText("[data-policy-title]", site.policyTitle);
  setText("[data-policy-text]", site.policyText);
  setText("[data-current-year]", new Date().getFullYear());

  document.querySelectorAll("[data-phone-link]").forEach((link) => {
    link.href = `tel:${site.phone || ""}`;
  });
  document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
    link.href = site.whatsapp || "#";
  });
  document.querySelectorAll("[data-telegram-link]").forEach((link) => {
    link.href = site.telegram || "#";
  });
  document.querySelectorAll("[data-map-link]").forEach((link) => {
    link.href = site.mapLink || "#";
  });
  document.querySelectorAll("[data-map-embed]").forEach((frame) => {
    if (site.mapEmbed) frame.src = site.mapEmbed;
  });

  const footerFields = {
    home: "footerHome",
    rooms: "footerRooms",
    host: "footerHost",
    location: "footerLocation",
    booking: "footerBooking",
  };
  setText("[data-footer-note]", site[footerFields[page]] || site.footerHome);
};

const renderStats = (items = []) => {
  const container = document.querySelector("[data-stats]");
  if (!container) return;
  container.replaceChildren(
    ...items.map((item, index) => {
      const article = createElement("article", "stat-item reveal");
      article.style.setProperty("--delay", `${index * 80}ms`);
      article.append(createElement("strong", "", item.value), createElement("span", "", item.label));
      return article;
    })
  );
};

const renderHomeZones = (items = []) => {
  const container = document.querySelector("[data-home-zones]");
  if (!container) return;
  container.replaceChildren(
    ...items.map((item, index) => {
      const article = createElement("article", "zone-item reveal");
      article.style.setProperty("--delay", `${index * 70}ms`);
      const copy = createElement("div");
      copy.append(createElement("h3", "", item.title), createElement("p", "", item.text));
      article.append(createElement("span", "", String(index + 1).padStart(2, "0")), copy);
      return article;
    })
  );
};

const renderGallery = (items = []) => {
  const container = document.querySelector("[data-gallery]");
  if (!container) return;
  container.replaceChildren(
    ...items.map((item, index) => {
      const button = createElement("button", "gallery-item reveal");
      button.type = "button";
      button.style.setProperty("--delay", `${index * 70}ms`);
      button.setAttribute("aria-label", `Открыть фото: ${item.title}`);
      const image = createElement("img");
      image.src = item.image;
      image.alt = item.alt || item.title;
      image.loading = "lazy";
      const caption = createElement("span", "gallery-caption");
      caption.append(createElement("span", "", item.category), createElement("strong", "", item.title));
      button.append(image, caption);
      button.addEventListener("click", () => openLightbox(item));
      return button;
    })
  );
};

const openLightbox = (item) => {
  const dialog = document.querySelector("[data-lightbox]");
  if (!dialog) return;
  const image = dialog.querySelector("[data-lightbox-image]");
  image.src = item.image;
  image.alt = item.alt || item.title;
  dialog.querySelector("[data-lightbox-category]").textContent = item.category || "";
  dialog.querySelector("[data-lightbox-title]").textContent = item.title || "";
  dialog.showModal();
};

const renderRooms = (items = []) => {
  const container = document.querySelector("[data-room-list]");
  if (!container) return;
  container.replaceChildren(
    ...items.map((item, index) => {
      const article = createElement("article", "room-row reveal");
      article.style.setProperty("--delay", `${index * 60}ms`);
      const link = createElement("a", "room-select-link", "→");
      link.href = `booking.html?room=${encodeURIComponent(item.title)}`;
      link.setAttribute("aria-label", `Выбрать: ${item.title}`);
      article.append(
        createElement("span", "room-number", String(index + 1).padStart(2, "0")),
        createElement("h3", "", item.title),
        createElement("p", "", item.text),
        createElement("small", "", item.facts),
        link
      );
      return article;
    })
  );
};

const renderRoomZones = (items = []) => {
  const container = document.querySelector("[data-room-zones]");
  if (!container) return;
  container.replaceChildren(
    ...items.map((item, index) => {
      const article = createElement("article", "large-zone-item reveal");
      article.style.setProperty("--delay", `${index * 80}ms`);
      const copy = createElement("div");
      copy.append(createElement("h3", "", item.title), createElement("p", "", item.text));
      article.append(createElement("span", "", item.number || String(index + 1).padStart(2, "0")), copy);
      return article;
    })
  );
};

const renderPracticalItems = (items = []) => {
  const container = document.querySelector("[data-room-notes]");
  if (!container) return;
  container.replaceChildren(
    ...items.map((item, index) => {
      const article = createElement("article", "practical-item reveal");
      article.style.setProperty("--delay", `${index * 80}ms`);
      article.append(
        createElement("span", "", String(index + 1).padStart(2, "0")),
        createElement("h3", "", item.title),
        createElement("p", "", item.text)
      );
      return article;
    })
  );
};

const renderParagraphs = (selector, items = []) => {
  const container = document.querySelector(selector);
  if (!container) return;
  container.replaceChildren(
    ...items.map((item, index) => {
      const paragraph = createElement("p", "reveal", item);
      paragraph.style.setProperty("--delay", `${index * 70}ms`);
      return paragraph;
    })
  );
};

const renderList = (selector, items = []) => {
  const container = document.querySelector(selector);
  if (!container) return;
  container.replaceChildren(...items.map((item) => createElement("li", "", item)));
};

const renderFestivals = (items = []) => {
  const container = document.querySelector("[data-festivals]");
  if (!container) return;
  container.replaceChildren(
    ...items.map((item, index) => {
      const article = createElement("article", "festival-card reveal");
      article.style.setProperty("--delay", `${index * 90}ms`);
      const image = createElement("img");
      image.src = item.image;
      image.alt = item.title;
      image.loading = "lazy";
      const copy = createElement("div", "festival-card-content");
      copy.append(
        createElement("span", "festival-date", item.date),
        createElement("h3", "", item.title),
        createElement("p", "", item.text),
        createElement("span", "festival-status", item.status)
      );
      if (item.sourceUrl) {
        const link = createElement("a", "text-link", `${item.sourceLabel || "Источник"} ↗`);
        link.href = item.sourceUrl;
        link.target = "_blank";
        link.rel = "noreferrer";
        copy.append(link);
      }
      article.append(image, copy);
      return article;
    })
  );
};

const renderAudiences = (items = []) => {
  const container = document.querySelector("[data-group-audiences]");
  if (!container) return;
  container.replaceChildren(
    ...items.map((item, index) => {
      const article = createElement("article", "audience-item reveal");
      article.style.setProperty("--delay", `${index * 80}ms`);
      article.append(createElement("h3", "", item.title), createElement("p", "", item.text));
      return article;
    })
  );
};

const renderActivities = (items = []) => {
  const container = document.querySelector("[data-activities]");
  if (!container) return;
  container.replaceChildren(
    ...items.map((item, index) => {
      const article = createElement("article", "activity-row reveal");
      article.style.setProperty("--delay", `${index * 60}ms`);
      article.append(
        createElement("span", "", item.number || String(index + 1).padStart(2, "0")),
        createElement("h3", "", item.title),
        createElement("small", "", item.meta),
        createElement("p", "", item.text)
      );
      return article;
    })
  );
};

const renderGuide = (items = []) => {
  const container = document.querySelector("[data-guide-items]");
  if (!container) return;
  container.replaceChildren(
    ...items.map((item, index) => {
      const article = createElement("article", "guide-item reveal");
      article.style.setProperty("--delay", `${index * 70}ms`);
      article.append(createElement("span", "", item.label), createElement("h3", "", item.title), createElement("p", "", item.text));
      return article;
    })
  );
};

const renderBookingSteps = (items = []) => {
  const container = document.querySelector("[data-booking-steps]");
  if (!container) return;
  container.replaceChildren(
    ...items.map((item, index) => {
      const article = createElement("article", "process-step reveal");
      article.style.setProperty("--delay", `${index * 80}ms`);
      article.append(
        createElement("span", "", String(index + 1).padStart(2, "0")),
        createElement("h3", "", item.title),
        createElement("p", "", item.text)
      );
      return article;
    })
  );
};

const renderFaq = (items = []) => {
  const container = document.querySelector("[data-faq-list]");
  if (!container) return;
  container.replaceChildren(
    ...items.map((item, index) => {
      const details = createElement("details", "faq-item reveal");
      details.style.setProperty("--delay", `${index * 45}ms`);
      details.append(createElement("summary", "", item.question), createElement("p", "", item.answer));
      return details;
    })
  );
};

const renderReview = () => {
  const reviews = loadedContent?.reviews?.items || [];
  const slider = document.querySelector("[data-review-slider]");
  if (!slider || !reviews.length) return;
  reviewIndex = (reviewIndex + reviews.length) % reviews.length;
  const review = reviews[reviewIndex];
  const card = createElement("article", "review-card");
  const meta = createElement("div", "review-meta");
  meta.append(createElement("strong", "", review.name), createElement("span", "", review.meta));
  if (review.sourceUrl) {
    const source = createElement("a", "review-source", review.source || "Источник");
    source.href = review.sourceUrl;
    source.target = "_blank";
    source.rel = "noreferrer";
    meta.append(source);
  }
  card.append(meta, createElement("blockquote", "", `«${review.text}»`));
  slider.replaceChildren(card);
  setText("[data-review-count]", `${String(reviewIndex + 1).padStart(2, "0")} / ${String(reviews.length).padStart(2, "0")}`);
  document.querySelectorAll("[data-review-dots] .review-dot").forEach((dot, index) => {
    dot.classList.toggle("is-active", index === reviewIndex);
    dot.setAttribute("aria-current", index === reviewIndex ? "true" : "false");
  });
};

const setupReviews = () => {
  const reviews = loadedContent?.reviews?.items || [];
  const dots = document.querySelector("[data-review-dots]");
  if (!reviews.length || !dots) return;
  dots.replaceChildren(
    ...reviews.map((_, index) => {
      const dot = createElement("button", "review-dot");
      dot.type = "button";
      dot.setAttribute("aria-label", `Показать отзыв ${index + 1}`);
      dot.addEventListener("click", () => {
        reviewIndex = index;
        renderReview();
        restartReviewTimer();
      });
      return dot;
    })
  );
  document.querySelector("[data-review-prev]")?.addEventListener("click", () => {
    reviewIndex -= 1;
    renderReview();
    restartReviewTimer();
  });
  document.querySelector("[data-review-next]")?.addEventListener("click", () => {
    reviewIndex += 1;
    renderReview();
    restartReviewTimer();
  });
  renderReview();
  restartReviewTimer();
};

const restartReviewTimer = () => {
  window.clearInterval(reviewTimer);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  reviewTimer = window.setInterval(() => {
    reviewIndex += 1;
    renderReview();
  }, 7500);
};

const populateRoomSelect = (rooms = []) => {
  const select = document.querySelector("#roomSelect");
  if (!select) return;
  const requested = new URLSearchParams(window.location.search).get("room") || select.value;
  const options = rooms.map((room) => {
    const option = createElement("option", "", room.title);
    option.value = room.title;
    return option;
  });
  const help = createElement("option", "", "Нужна помощь с выбором");
  help.value = "Нужна помощь с выбором";
  select.replaceChildren(...options, help);
  const match = [...select.options].find((option) => option.value === requested);
  select.value = match ? match.value : help.value;
};

const applyPageContent = (content) => {
  bindEditableContent(content);
  applySiteContent(content);

  if (page === "home") {
    renderStats(content.home?.about?.stats);
    renderHomeZones(content.home?.about?.zones);
    renderGallery(content.home?.gallery?.items);
    setupReviews();
  }

  if (page === "rooms") {
    renderRooms(content.rooms?.rooms);
    renderRoomZones(content.rooms?.zones?.items);
    renderPracticalItems(content.rooms?.notes?.items);
  }

  if (page === "host") {
    renderParagraphs("[data-host-story]", content.host?.story?.paragraphs);
    renderList("[data-host-help]", content.host?.help?.items);
    renderList("[data-food-items]", content.host?.food?.items);
    renderFestivals(content.host?.festivals?.items);
  }

  if (page === "location") {
    renderAudiences(content.location?.groups?.audiences);
    renderList("[data-group-organize]", content.location?.groups?.organize);
    renderActivities(content.location?.activities?.items);
    renderGuide(content.location?.guide?.items);
  }

  if (page === "booking") {
    renderBookingSteps(content.booking?.process?.steps);
    renderFaq(content.booking?.faq?.items);
    populateRoomSelect(content.rooms?.rooms);
  }
};

const setupNavigation = () => {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  if (!toggle || !nav) return;

  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Открыть меню");
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Открыть меню" : "Закрыть меню");
    nav.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("nav-open", !isOpen);
  });
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
  window.matchMedia("(min-width: 821px)").addEventListener("change", (event) => {
    if (event.matches) close();
  });
};

const setupDialogs = () => {
  const policy = document.querySelector("[data-policy-dialog]");
  document.querySelectorAll("[data-policy-open]").forEach((button) => {
    button.addEventListener("click", () => policy?.showModal());
  });
  document.querySelectorAll("[data-policy-close]").forEach((button) => {
    button.addEventListener("click", () => policy?.close());
  });

  const lightbox = document.querySelector("[data-lightbox]");
  document.querySelector("[data-lightbox-close]")?.addEventListener("click", () => lightbox?.close());
  [policy, lightbox].forEach((dialog) => {
    dialog?.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });

  const confirmation = document.querySelector("#confirmationDialog");
  document.querySelectorAll("[data-confirmation-close]").forEach((button) => {
    button.addEventListener("click", () => confirmation?.close());
  });
};

const setupReveals = () => {
  const items = [...document.querySelectorAll(".reveal:not(.is-visible)")];
  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
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
    { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
  );
  items.forEach((item) => observer.observe(item));
};

const setupBookingForm = () => {
  const form = document.querySelector("#bookingForm");
  if (!form) return;
  const status = document.querySelector("#formStatus");
  const confirmation = document.querySelector("#confirmationDialog");
  const dialogTitle = document.querySelector("#dialogTitle");
  const dialogText = document.querySelector("#dialogText");
  const checkin = form.elements.checkin;
  const checkout = form.elements.checkout;
  const today = new Date();
  const minimumDate = today.toISOString().slice(0, 10);
  checkin.min = minimumDate;
  checkout.min = minimumDate;

  checkin.addEventListener("change", () => {
    checkout.min = checkin.value || minimumDate;
    if (checkout.value && checkout.value <= checkin.value) checkout.value = "";
  });

  const requestedMessage = new URLSearchParams(window.location.search).get("message");
  if (requestedMessage) form.elements.message.value = requestedMessage;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "Отправляем заявку...";
    const submit = form.querySelector("[type='submit']");
    submit.disabled = true;
    const data = Object.fromEntries(new FormData(form).entries());

    if (new Date(data.checkout) <= new Date(data.checkin)) {
      status.textContent = "Дата выезда должна быть позже даты заезда.";
      submit.disabled = false;
      return;
    }

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || "Не удалось отправить заявку");

      status.textContent = result.delivered ? "Заявка отправлена Катерине." : "Форма проверена. Продублируйте заявку в WhatsApp.";
      const checkinText = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(new Date(`${data.checkin}T12:00:00`));
      const delivery = result.delivered
        ? "Заявка уже пришла в Telegram."
        : "Уведомления Telegram пока не подключены. Продублируйте сообщение в WhatsApp, чтобы Катерина точно его увидела.";
      dialogTitle.textContent = result.delivered
        ? "Спасибо. Катерина получила ваш запрос."
        : "Форма работает, но доставка пока не подключена.";
      dialogText.textContent = `${checkinText}, ${data.guests.toLowerCase()}, ${data.room}. ${delivery}`;
      confirmation?.showModal();
      form.reset();
      populateRoomSelect(loadedContent?.rooms?.rooms || []);
    } catch (error) {
      status.textContent = `${error.message}. Можно сразу написать в WhatsApp или позвонить.`;
    } finally {
      submit.disabled = false;
    }
  });
};

const loadContent = async () => {
  try {
    const response = await fetch("/api/content", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error("Контент недоступен");
    loadedContent = result.content;
    applyPageContent(loadedContent);
  } catch (error) {
    console.warn("Editable content is unavailable", error);
  } finally {
    setupReveals();
  }
};

setupNavigation();
setupDialogs();
setupBookingForm();
loadContent();
