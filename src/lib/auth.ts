import type { AuthError, Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

export type SignInResult = {
  session: Session | null;
  error: AuthError | null;
};

export type SignUpResult = {
  session: Session | null;
  /** Present when sign-up succeeded but email confirmation is required before a session exists. */
  needsEmailConfirmation: boolean;
  error: AuthError | null;
};

/**
 * Email + password sign-in. Requires Email provider enabled in Supabase (Authentication → Providers).
 */
export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<SignInResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { session: data.session ?? null, error };
}

/**
 * Email + password sign-up. Optional redirect URL is used in confirmation emails when
 * “Confirm email” is enabled in Supabase (Authentication → Providers → Email).
 */
export async function signUpWithEmailPassword(
  email: string,
  password: string,
  emailRedirectTo?: string
): Promise<SignUpResult> {
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "";
  const redirect = emailRedirectTo ?? (origin ? `${origin}/` : undefined);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: redirect ? { emailRedirectTo: redirect } : undefined,
  });

  const session = data.session ?? null;
  const user = data.user ?? null;
  const needsEmailConfirmation = Boolean(user && !session);

  return {
    session,
    needsEmailConfirmation,
    error,
  };
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut();
  return { error };
}
