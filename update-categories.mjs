// עדכון שמות קטגוריות בדאטה. הרצה: node --env-file=migrate-secrets.env update-categories.mjs
const { NEW_URL, NEW_SERVICE } = process.env;
const h = {
  apikey: NEW_SERVICE,
  Authorization: `Bearer ${NEW_SERVICE}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

async function rename(from, to) {
  const r = await fetch(
    `${NEW_URL}/rest/v1/songs?category=eq.${encodeURIComponent(from)}`,
    { method: "PATCH", headers: h, body: JSON.stringify({ category: to }) }
  );
  console.log(`"${from}" → "${to}": ${r.ok ? "OK" : r.status + " " + (await r.text())}`);
}

await rename("שיעורי מוזיקה", "שירי הוד");
await rename("שירי הודה", "שירי סמבה");
console.log('(אין שירים ב"שיעור מתחילים" — אין מה למחוק בדאטה)');
