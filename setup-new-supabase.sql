-- הקמת הסכמה בפרויקט Supabase החדש של שירי אנגולה.
-- להריץ ב: Dashboard של הפרויקט החדש → SQL Editor → New query → הדבק → Run

-- טבלת השירים
create table if not exists songs (
  id uuid primary key default gen_random_uuid(),
  title text,
  category text,
  lyrics_pt text,
  lyrics_he text,
  audio_url text,
  created_at timestamptz default now()
);

alter table songs enable row level security;
create policy "public select" on songs for select using (true);
create policy "public insert" on songs for insert with check (true);
create policy "public update" on songs for update using (true);
create policy "public delete" on songs for delete using (true);

-- bucket לקבצי שמע (ציבורי)
insert into storage.buckets (id, name, public)
values ('audio', 'audio', true)
on conflict (id) do nothing;

create policy "public upload audio" on storage.objects
  for insert with check (bucket_id = 'audio');
create policy "public read audio" on storage.objects
  for select using (bucket_id = 'audio');
