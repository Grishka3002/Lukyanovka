const DATE = /^\d{4}-\d{2}-\d{2}$/;
const isDate = (value) => {
  if (typeof value !== "string" || !DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};
const todayInVladivostok = (now = new Date()) => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Vladivostok", year: "numeric", month: "2-digit", day: "2-digit"
}).format(now);

const validateBooking = (payload, today = todayInVladivostok()) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { error: "Проверьте данные заявки." };
  }
  const limits = { name: 100, phone: 40, messenger: 20, checkin: 10, checkout: 10, guests: 30, room: 160, message: 1200 };
  const data = {};
  for (const [field, max] of Object.entries(limits)) {
    const value = payload[field] ?? "";
    if (typeof value !== "string" || value.length > max) return { error: "Проверьте поля заявки." };
    data[field] = value.trim();
  }
  if (payload.consent !== "yes") return { error: "Подтвердите согласие на обработку заявки." };
  if (data.phone.replace(/\D/g, "").length < 7) return { error: "Укажите номер телефона для ответа." };
  if (!isDate(data.checkin) || !isDate(data.checkout)) return { error: "Укажите корректные даты поездки." };
  if (data.checkin < today) return { error: "Дата заезда не может быть в прошлом." };
  if (data.checkout <= data.checkin) return { error: "Дата выезда должна быть позже даты заезда." };
  if (!["1 гость", "2 гостя", "3-4 гостя", "5-6 гостей", "7-8 гостей", "9-10 гостей"].includes(data.guests)) {
    return { error: "Выберите количество гостей." };
  }
  if (data.messenger && !["WhatsApp", "Telegram", "Звонок"].includes(data.messenger)) {
    return { error: "Выберите способ ответа." };
  }
  data.name ||= "Не указано";
  data.room ||= "Нужна помощь с выбором";
  data.consent = "yes";
  return { data };
};
module.exports = { isDate, todayInVladivostok, validateBooking };
