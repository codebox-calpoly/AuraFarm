import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// TEMPORARY DIAGNOSTIC HARDCODING
const HARDCODED_URL = "https://iopwvrxbppgrlgeuemex.supabase.co";
const HARDCODED_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvcHd2cnhicHBncmxnZXVlbWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNDE0MjUsImV4cCI6MjA3ODgxNzQyNX0.iFCb3TKuj9YXAK7HMniA2K-5hZgInxpMC4BwtycOPCM";

const supabaseUrl =
  HARDCODED_URL ||
  Constants.expoConfig?.extra?.supabaseUrl ||
  process.env.EXPO_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  HARDCODED_KEY ||
  Constants.expoConfig?.extra?.supabaseAnonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('--- SUPABASE CONFIG DIAGNOSTIC ---');
console.log('Final URL:', supabaseUrl);
console.log('Key Length:', supabaseAnonKey?.length);
console.log('Using Expo Constants:', !!Constants.expoConfig?.extra?.supabaseUrl);
console.log('---------------------------------');

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
