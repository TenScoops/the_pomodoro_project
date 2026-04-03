import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

type UseAuthResult = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  /** Set when getSession fails (network or config); sign-in flow can still work after. */
  authError: string | null;
};

/**
 * Single subscription to Supabase auth so the shell and sidebar stay in sync
 * without duplicate listeners or a separate backend session check.
 */
export function useAuth(): UseAuthResult {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void supabase.auth
      .getSession()
      .then(({ data: { session: initialSession }, error }) => {
        if (cancelled) {
          return;
        }
        if (error) {
          setAuthError(error.message);
          setSession(null);
        } else {
          setAuthError(null);
          setSession(initialSession);
        }
        setLoading(false);
      })
      .catch((unknownError: unknown) => {
        if (cancelled) {
          return;
        }
        const message =
          unknownError instanceof Error ? unknownError.message : "Could not load session.";
        setAuthError(message);
        setSession(null);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!cancelled) {
        setSession(nextSession);
        if (nextSession) {
          setAuthError(null);
        }
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user: session?.user ?? null,
    loading,
    authError,
  };
}
