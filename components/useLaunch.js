"use client";

import { useEffect, useState } from "react";
import { launchDeadline } from "../lib/launch";

// Launch-fasen afgøres klient-side (afhænger af "nu"), så vi undgår hydration-
// mismatch: server + første render returnerer inaktiv, og efter mount sættes den
// rigtige tilstand. ?launch=<iso> i URL'en kan override deadline til PREVIEW-formål
// (påvirker ikke rigtige besøgende, som ingen param har).
export function useLaunch() {
  const [state, setState] = useState({ mounted: false, deadline: null, active: false });
  useEffect(() => {
    let deadline = launchDeadline();
    try {
      const ov = new URLSearchParams(window.location.search).get("launch");
      if (ov) {
        const d = new Date(ov);
        if (!Number.isNaN(d.getTime())) deadline = d;
      }
    } catch {
      /* ingen window/param — behold env-deadline */
    }
    setState({ mounted: true, deadline, active: !!deadline && deadline.getTime() > Date.now() });
  }, []);
  return state;
}
