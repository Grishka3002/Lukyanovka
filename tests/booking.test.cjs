const { test } = require("node:test");
const assert = require("node:assert/strict");
const { validateBooking, isDate, todayInVladivostok } = require("../booking-validation.cjs");
const valid = { phone: "+7 914 000-00-00", checkin: "2026-12-10", checkout: "2026-12-12", guests: "2 гостя", consent: "yes" };
const validate = (data) => validateBooking(data, "2026-12-01");

test("initial inquiry accepts optional name and room", () => {
  const result = validate(valid);
  assert.equal(result.error, undefined);
  assert.equal(result.data.room, "Нужна помощь с выбором");
  assert.equal(result.data.name, "Не указано");
});
test("explicit room selection survives validation", () => {
  assert.equal(validate({ ...valid, room: "Комната 03" }).data.room, "Комната 03");
});
test("rejects invalid dates, past check-in, and nonpositive stay", () => {
  for (const patch of [{ checkin: "2026-02-30" }, { checkin: "2026-11-30" },
    { checkout: "2026-12-10" }, { checkout: "2026-12-09" }, { checkin: "garbage" }]) {
    assert.ok(validate({ ...valid, ...patch }).error);
  }
  assert.equal(isDate("2028-02-29"), true);
  assert.equal(isDate("2026-02-29"), false);
});
test("requires consent and contact and bounds all free text", () => {
  for (const patch of [{ consent: false }, { consent: "no" }, { phone: "123" },
    { phone: {} }, { message: "x".repeat(1201) }, { guests: "100 гостей" }, { messenger: "unknown" }]) {
    assert.ok(validate({ ...valid, ...patch }).error);
  }
  assert.ok(validate(null).error);
  assert.ok(validate([]).error);
});
test("uses Vladivostok's date across the UTC day boundary", () => {
  assert.equal(todayInVladivostok(new Date("2026-11-10T15:00:00Z")), "2026-11-11");
  assert.equal(todayInVladivostok(new Date("2026-11-10T13:00:00Z")), "2026-11-10");
});
