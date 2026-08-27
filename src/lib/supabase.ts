import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zembhtleysaklbtzivai.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplbWJodGxleXNha2xidHppdmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzU1MTAsImV4cCI6MjA5Mzc1MTUxMH0.aIRoefB22F_BXJvNL8Xp81DoGx1DFvzA6pq5yBEUak0';

export const supabase = createClient(supabaseUrl, supabaseKey);
