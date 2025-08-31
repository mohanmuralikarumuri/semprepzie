// Supabase configuration
import { createClient } from '@supabase/supabase-js';

// Supabase URL and anon key (from your existing storage URLs, I can see the project URL)
const supabaseUrl = 'https://lnbjkowlhordgyhzhpgi.supabase.co';

// Your Supabase anon key - uses Vite environment variable or fallback
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuYmprb3dsaG9yZGd5aHpocGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMjU4NzksImV4cCI6MjA3MTYwMTg3OX0.Lz0q_S-5SNZwakaahWVGCwGesaGhK9SLoTBFRqUdgLY';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log initialization for debugging
console.log('Supabase initialized:', {
  url: supabaseUrl,
  keyPrefix: supabaseAnonKey.substring(0, 20) + '...',
  isConnected: !!supabase
});

// Types for our database tables (matching your exact structure)
export interface DatabaseSubject {
  id: string; // TEXT (matches your data: "ooad", "ai", etc.)
  name: string;
  icon: string; // e.g. "🤖"
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseUnit {
  id: string; // TEXT (matches your data: "ooad-unit1", "ai-unit1", etc.)
  subject_id: string; // FK → subjects.id
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseDocument {
  id: string; // TEXT (matches your data: "ooad-unit1-doc1", etc.)
  unit_id: string; // FK → units.id
  title: string;
  type: string; // e.g. "pdf"
  url: string; // Supabase storage public URL
  original_url: string;
  uploaded_at?: string; // timestamp, default now()
  created_at?: string;
  updated_at?: string;
}
