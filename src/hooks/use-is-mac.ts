"use client";

import { useEffect, useState } from "react";

export function useIsMac(): boolean {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    const userAgent =
      typeof navigator !== "undefined" ? navigator.userAgent : "";
    setIsMac(userAgent.includes("Mac OS X"));
  }, []);

  return isMac;
}
