import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://ombgkdkijhzkafcbwmjl.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjY0MmYzMThmLTI5YmYtNDM5Mi1iMGViLTJmOTIxOWU4NzQwMSJ9.eyJwcm9qZWN0SWQiOiJvbWJna2RraWpoemthZmNid21qbCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzcxODMwMzQxLCJleHAiOjIwODcxOTAzNDEsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.1nx2mO_GgcoCkrwTF2iJv3kb8TEWeyd7uCnjrwugeOo';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };