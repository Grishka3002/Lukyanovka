const header = document.querySelector(".site-header");
const bookingForm = document.querySelector("#bookingForm");
const houseSelect = document.querySelector("#houseSelect");
const dialog = document.querySelector("#bookingDialog");
const dialogText = document.querySelector("#dialogText");
const dialogClose = document.querySelector(".dialog-close");
const dialogOk = document.querySelector("#dialogOk");

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

const openDialog = (data) => {
  if (!dialog || !dialogText) return;

  const nights = Math.max(
    1,
    Math.round((new Date(data.checkout) - new Date(data.checkin)) / 86_400_000)
  );
  const intro = data.name ? `${data.name}, заявка собрана.` : "Заявка собрана.";
  dialogText.textContent = `${intro} ${formatDate(data.checkin)} - ${formatDate(data.checkout)}, ${nights} ноч., ${data.guests.toLowerCase()}, комната: ${data.house}. Осталось подключить реальную отправку Катерине.`;

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

document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("change", (event) => {
    if (event.target.matches('input[name="checkin"]')) {
      ensureCheckoutAfterCheckin(form);
    }
  });
});

bookingForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  ensureCheckoutAfterCheckin(bookingForm);

  const formData = Object.fromEntries(new FormData(bookingForm).entries());
  openDialog(formData);
  bookingForm.reset();
  setInitialDates();
  applyRoomFromUrl();
});

dialogClose?.addEventListener("click", closeDialog);
dialogOk?.addEventListener("click", closeDialog);
dialog?.addEventListener("close", () => document.body.classList.remove("dialog-open"));

setInitialDates();
ensureCheckoutAfterCheckin(bookingForm);
applyRoomFromUrl();
setupRevealAnimations();
