// העברת שירי אנגולה מ-Supabase ישן לחדש: נתוני songs + קבצי שמע ב-Storage.
// הרצה:  node --env-file=migrate-secrets.env migrate.mjs
// בטוח להריץ שוב (אידמפוטנטי) — מדלג על קבצים/שירים שכבר קיימים.

const { OLD_URL, OLD_KEY, NEW_URL, NEW_SERVICE } = process.env;
const oldHost = new URL(OLD_URL).host;
const newHost = new URL(NEW_URL).host;

const oldHeaders = { apikey: OLD_KEY, Authorization: `Bearer ${OLD_KEY}` };
const newHeaders = { apikey: NEW_SERVICE, Authorization: `Bearer ${NEW_SERVICE}` };

async function main() {
  console.log("שולף שירים מהפרויקט הישן...");
  const songs = await fetch(`${OLD_URL}/rest/v1/songs?select=*`, {
    headers: oldHeaders,
  }).then((r) => r.json());
  console.log(`נמצאו ${songs.length} שירים\n`);

  let ok = 0;
  for (const song of songs) {
    let audioUrl = song.audio_url;

    // 1. העברת קובץ השמע (אם יש)
    if (audioUrl && audioUrl.includes(oldHost) && audioUrl.includes("/audio/")) {
      const filename = audioUrl.split("/audio/")[1].split("?")[0];
      try {
        const buf = Buffer.from(
          await fetch(audioUrl).then((r) => {
            if (!r.ok) throw new Error(`download ${r.status}`);
            return r.arrayBuffer();
          })
        );
        const up = await fetch(`${NEW_URL}/storage/v1/object/audio/${filename}`, {
          method: "POST",
          headers: { ...newHeaders, "Content-Type": "audio/mp4", "x-upsert": "true" },
          body: buf,
        });
        if (!up.ok && up.status !== 409) {
          throw new Error(`upload ${up.status} ${await up.text()}`);
        }
        audioUrl = `${NEW_URL}/storage/v1/object/public/audio/${filename}`;
        console.log(`  🎵 ${filename} (${(buf.length / 1024 / 1024).toFixed(1)}MB)`);
      } catch (e) {
        console.error(`  ✗ שמע נכשל (${song.title}): ${e.message}`);
      }
    }

    // 2. הכנסת השיר לפרויקט החדש (שומר id מקורי, מעדכן את ה-URL)
    const row = {
      id: song.id,
      title: song.title,
      category: song.category,
      lyrics_pt: song.lyrics_pt,
      lyrics_he: song.lyrics_he,
      audio_url: audioUrl,
      created_at: song.created_at,
    };
    const ins = await fetch(`${NEW_URL}/rest/v1/songs?on_conflict=id`, {
      method: "POST",
      headers: {
        ...newHeaders,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(row),
    });
    if (ins.ok) {
      ok++;
      console.log(`  ✓ ${song.title}`);
    } else {
      console.error(`  ✗ שיר נכשל (${song.title}): ${ins.status} ${await ins.text()}`);
    }
  }

  console.log(`\nהועברו ${ok}/${songs.length} שירים. host חדש: ${newHost}`);
}

main().catch((e) => {
  console.error("שגיאה כללית:", e);
  process.exit(1);
});
