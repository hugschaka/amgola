-- Supabase RLS Policies for Shiri Angola
-- Project: lgeinxbvhbtxtllylcvv
-- Execute in: https://supabase.com/dashboard/project/lgeinxbvhbtxtllylcvv/sql/new

-- Policy 1: Allow public SELECT on songs table
CREATE POLICY "public select" ON songs 
FOR SELECT USING (true);

-- Policy 2: Allow public INSERT on songs table
CREATE POLICY "public insert" ON songs 
FOR INSERT WITH CHECK (true);

-- Policy 3: Allow public UPDATE on songs table
CREATE POLICY "public update" ON songs 
FOR UPDATE USING (true);

-- Policy 4: Allow public DELETE on songs table
CREATE POLICY "public delete" ON songs 
FOR DELETE USING (true);

-- Policy 5: Allow public upload to audio storage bucket
CREATE POLICY "public upload audio" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'audio');

-- Verify policies are created:
-- SELECT tablename, policyname, qual, with_check FROM pg_policies WHERE tablename = 'songs' OR tablename = 'objects';
