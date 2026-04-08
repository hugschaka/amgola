# Supabase RLS Policy Setup

## Project Details
- **Project ID**: lgeinxbvhbtxtllylcvv
- **Dashboard**: https://supabase.com/dashboard/project/lgeinxbvhbtxtllylcvv
- **SQL Editor**: https://supabase.com/dashboard/project/lgeinxbvhbtxtllylcvv/sql/new

## Instructions

### Method 1: Via SQL Editor (Recommended)

1. Open: https://supabase.com/dashboard/project/lgeinxbvhbtxtllylcvv/sql/new
2. Copy the entire content of `supabase_rls.sql` from this folder
3. Paste into the SQL editor
4. Click "Run"
5. Verify: No errors should appear (if "policy already exists" - that's fine)

### Method 2: One Statement at a Time

If the bulk upload fails, run each statement separately:

```sql
CREATE POLICY "public select" ON songs FOR SELECT USING (true);
CREATE POLICY "public insert" ON songs FOR INSERT WITH CHECK (true);
CREATE POLICY "public update" ON songs FOR UPDATE USING (true);
CREATE POLICY "public delete" ON songs FOR DELETE USING (true);
CREATE POLICY "public upload audio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'audio');
```

## Verification

After running the policies:

1. Go to: https://shiri-angola.vercel.app
2. On mobile or desktop, click "העלאת שיר" (Upload)
3. Enter password: `555`
4. Try uploading a song with an audio file
5. If audio uploads successfully, policies are working!

## Troubleshooting

- **"policy already exists"** → This is OK, policies are already set up
- **"permission denied"** → Make sure you're in the SQL Editor as an authenticated user
- **Audio still fails** → Check browser console for network errors, RLS policies may need browser page refresh

## Related Files

- `index.html` - Main app (includes RLS-protected Supabase calls)
- `supabase_rls.sql` - SQL statements for this setup
