import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient('https://ktmcsfwvzzxkrjvojejq.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0bWNzZnd2enp4a3Jqdm9qZWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNjczODcsImV4cCI6MjA1OTc0MzM4N30.3stN4FEpjOi8zwvdXLti72lNMYesXbhIcvGI2I4obaE');

export default supabase;