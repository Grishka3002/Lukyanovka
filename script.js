const header = document.querySelector(".site-header");
const quickBooking = document.querySelector("#quickBooking");
const bookingForm = document.querySelector("#bookingForm");
const houseSelect = document.querySelector("#houseSelect");
const dialog = document.querySelector("#bookingDialog");
const dialogText = document.querySelector("#dialogText");
const dialogClose = document.querySelector(".dialog-close");
const dialogOk = document.querySelector("#dialogOk");
const houseButtons = document.querySelectorAll("[data-house]");

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
    input.value = toDateInputValue(tomorrow);
  });

  document.querySelectorAll('input[name="checkout"]').forEach((input) => {
    input.value = toDateInputValue(dayAfter);
  });
};

const formatDate = (value) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
  }).format(new Date(value));

const ensureCheckoutAfterCheckin = (form) => {
  const checkin = form.elements.checkin;
  const checkout = form.elements.checkout;
  if (!checkin || !checkout || !checkin.value) return;

  const minCheckout = new Date(checkin.value);
  minCheckout.setDate(minCheckout.getDate() + 1);
  checkout.min = toDateInputValue(minCheckout);

  if (!checkout.value || new Date(checkout.value) <= new Date(checkin.value)) {
    checkout.value = toDateInputValue(minCheckout);
  }
};

const syncBookingForm = (sourceForm) => {
  const source = new FormData(sourceForm);
  ["checkin", "checkout", "guests"].forEach((name) => {
    const target = bookingForm.elements[name];
    if (target && source.get(name)) target.value = source.get(name);
  });
  ensureCheckoutAfterCheckin(bookingForm);
};

const openDialog = (data) => {
  const nights = Math.max(
    1,
    Math.round((new Date(data.checkout) - new Date(data.checkin)) / 86_400_000)
  );
  const intro = data.name ? `${data.name}, заявка сохранена на странице.` : "Заявка сохранена на странице.";
  dialogText.textContent = `${intro} ${formatDate(data.checkin)} - ${formatDate(data.checkout)}, ${nights} ноч., ${data.guests.toLowerCase()}, комната: ${data.house}. Для реальной отправки осталось подключить контакт базы.`;

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
    document.body.classList.add("dialog-open");
  } else {
    alert(dialogText.textContent);
  }
};

const closeDialog = () => {
  dialog.close();
  document.body.classList.remove("dialog-open");
};

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
});

const setupRevealAnimations = () => {
  const revealGroups = [
    [".intro .section-kicker", "reveal-left"],
    [".intro h2", "reveal-right"],
    [".intro p", "reveal"],
    [".section-heading h2", "reveal-left"],
    [".section-heading p", "reveal-right"],
    [".house-card", "reveal"],
    [".activities-image", "reveal-left"],
    [".activities-content .script-word", "reveal"],
    [".activities-content h2", "reveal"],
    [".activity-list > div", "reveal"],
    [".booking-copy .script-word", "reveal-left"],
    [".booking-copy h2", "reveal-left"],
    [".booking-copy p", "reveal-left"],
    [".trust-list li", "reveal-left"],
    [".booking-form", "reveal-right"],
    [".contact-panel h2", "reveal-left"],
    [".contact-panel p", "reveal-left"],
    [".contact-actions", "reveal-left"],
    [".map-card", "reveal-right"],
  ];

  let revealIndex = 0;
  revealGroups.forEach(([selector, className]) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.classList.add("reveal", className);
      element.style.setProperty("--reveal-delay", `${Math.min((revealIndex % 4) * 90, 270)}ms`);
      revealIndex += 1;
    });
  });

  const revealElements = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.12,
    }
  );

  revealElements.forEach((element) => observer.observe(element));
};

document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("change", (event) => {
    if (event.target.matches('input[name="checkin"]')) {
      ensureCheckoutAfterCheckin(form);
    }
  });
});

quickBooking.addEventListener("submit", (event) => {
  event.preventDefault();
  syncBookingForm(quickBooking);
  document.querySelector("#booking").scrollIntoView({ behavior: "smooth", block: "start" });
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  ensureCheckoutAfterCheckin(bookingForm);

  const formData = Object.fromEntries(new FormData(bookingForm).entries());
  openDialog(formData);
  bookingForm.reset();
  setInitialDates();
});

houseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    houseSelect.value = button.dataset.house;
    document.querySelector("#booking").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

dialogClose.addEventListener("click", closeDialog);
dialogOk.addEventListener("click", closeDialog);
dialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));

setInitialDates();
ensureCheckoutAfterCheckin(quickBooking);
ensureCheckoutAfterCheckin(bookingForm);
setupRevealAnimations();
