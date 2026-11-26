import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = url && anon
  ? createClient(url, anon, { auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true } })
  : null;
export const isCloudConfigured = Boolean(supabase);
export async function googleLogin() {
  if (!supabase) throw new Error("Configure a separate Supabase project first.");
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin + "/" }
  });
  if (error) throw error;
}
export async function emailSignIn(email, password) {
  if (!supabase) throw new Error("Configure a separate Supabase project first.");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}
export async function emailSignUp(email, password) {
  if (!supabase) throw new Error("Configure a separate Supabase project first.");
  const { data, error } = await supabase.auth.signUp({
    email, password, options: { emailRedirectTo: window.location.origin + "/" }
  });
  if (error) throw error;
  return data;
}