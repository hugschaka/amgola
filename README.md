# שירי אנגולה — מדריך העלאה לאינטרנט

---

## מה יש בתיקייה?

```
index.html          ← הקובץ הראשי של האתר
קשישי.jpeg          ← תמונת הרקע
fonts/              ← גופנים (Hillel, Miri)
.claude/            ← תמונות עזר (לוגו אנגולה, color וכו')
```

---

## שלב 1 — העלאה ל־Vercel (אחסון חינמי)

### הכנה (פעם אחת)
1. היכנס ל־[vercel.com](https://vercel.com) וצור חשבון חינמי (אפשר עם Google)

### העלאה
2. בדף הבית של Vercel לחץ על **"Add New → Project"**
3. בחר **"Browse"** ← גרור את כל תיקיית הפרויקט לתוך החלון **או** השתמש ב־GitHub (ראה למטה)
4. Vercel יזהה אוטומטית שזה אתר סטטי — לחץ **Deploy**
5. תוך ~30 שניות תקבל קישור חי כגון: `https://shiri-angola.vercel.app`

### העלאה דרך GitHub (מומלץ לעדכונים עתידיים)
```
1. פתח GitHub Desktop או git bash
2. צור repo חדש מהתיקייה:
   git init
   git add .
   git commit -m "initial"
   git remote add origin https://github.com/USERNAME/shiri-angola.git
   git push -u origin main

3. ב־Vercel → "Import Git Repository" → בחר את ה־repo
4. כל push עתידי יעדכן את האתר אוטומטית ✓
```

---

## שלב 2 — Supabase (מסד נתונים לשמירת שירים)

כרגע השירים שמועלים נשמרים רק בזיכרון הדפדפן (נאבדים בריענון).
Supabase מאפשר לשמור שירים לצמיתות + לאחסן קבצי שמע.

### הכנה
1. היכנס ל־[supabase.com](https://supabase.com) וצור חשבון חינמי
2. לחץ **"New Project"** — תן לו שם (למשל `shiri-angola`) ובחר סיסמה
3. המתן ~2 דקות עד שה־project מוכן

### יצירת הטבלה
4. ב־Supabase לך ל־**SQL Editor** והרץ:

```sql
create table songs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null,
  lyrics_pt text,
  lyrics_he text,
  audio_url text,
  created_at timestamp default now()
);

-- אפשר גישה לקריאה וכתיבה (לאתר ציבורי)
alter table songs enable row level security;
create policy "public read" on songs for select using (true);
create policy "public insert" on songs for insert with check (true);
```

### אחסון קבצי שמע
5. ב־Supabase לך ל־**Storage → New Bucket**
   - שם: `audio`
   - סמן: **Public bucket** ✓
   - לחץ Create

### חיבור האתר ל־Supabase
6. ב־Supabase לך ל־**Settings → API** והעתק:
   - `Project URL` (נראה כך: `https://xxxx.supabase.co`)
   - `anon public key`

7. בתחילת קובץ `index.html` (אחרי תג `<script>`), הוסף:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  const SUPABASE_URL = 'https://XXXX.supabase.co';   // ← הדבק כאן
  const SUPABASE_KEY = 'eyJh...';                     // ← הדבק כאן
  const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // טעינת שירים בעת פתיחת האתר
  async function loadSongsFromDB() {
    const { data } = await db.from('songs').select('*');
    if (!data) return;
    data.forEach(s => {
      if (SONGS[s.category]) {
        SONGS[s.category].push({
          id: s.id, title: s.title,
          pt: s.lyrics_pt || '', he: s.lyrics_he || '',
          audio: s.audio_url || null
        });
      }
    });
  }
  loadSongsFromDB();

  // שמירת שיר חדש ב־DB בעת העלאה
  async function saveSongToDB(song, catName, audioFile) {
    let audioUrl = null;
    if (audioFile) {
      const path = `${Date.now()}_${audioFile.name}`;
      await db.storage.from('audio').upload(path, audioFile);
      const { data } = db.storage.from('audio').getPublicUrl(path);
      audioUrl = data.publicUrl;
    }
    await db.from('songs').insert({
      title: song.title, category: catName,
      lyrics_pt: song.pt, lyrics_he: song.he,
      audio_url: audioUrl
    });
  }
</script>
```

8. בפונקציה `handleUpload` קרא ל־`saveSongToDB(song, cat, audioFile)` אחרי יצירת `song`

---

## סיכום

| שלב | כלי | זמן | עלות |
|-----|-----|-----|------|
| אחסון האתר | Vercel | 5 דקות | חינם |
| מסד נתונים | Supabase | 15 דקות | חינם עד 500MB |
| שמירת שמע | Supabase Storage | כלול למעלה | חינם עד 1GB |

---

## שאלות?
פנה ל־[docs.supabase.com](https://supabase.com/docs) או [vercel.com/docs](https://vercel.com/docs)
