"use client";

import { useEffect, useState } from "react";
import { type UserProfile } from "@/lib/types";

export function useCurrentUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((me: UserProfile | null) => {
        if (active) {
          setUser(me);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  return { user, loaded };
}
