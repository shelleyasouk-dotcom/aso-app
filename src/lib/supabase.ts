import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yhsxtjttoxzhmbeenhow.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inloc3h0anR0b3h6aG1iZWVuaG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM5NTAsImV4cCI6MjA5MzczOTk1MH0.tvAFPS135WDyA44AkbMF98CkGxzhoX1Rbf7BU-IXKm4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

