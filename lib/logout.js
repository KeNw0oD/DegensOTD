import { signOut } from "next-auth/react";
import { supabase } from "./supabaseClient";

/**
 * Универсальный выход для Supabase и NextAuth (Kick)
 */
export async function logout() {
  try {
    // 1. Разлогиниваем Supabase
    await supabase.auth.signOut();

    // 2. Разлогиниваем NextAuth
    await signOut({ callbackUrl: "/" });
  } catch (err) {
    console.error("Logout error:", err);
  }
}
