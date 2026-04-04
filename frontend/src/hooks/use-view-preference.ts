import { useState, useCallback } from "react";
import type { ViewMode } from "@/components/ui/view-toggle";

const STORAGE_KEY = "skyops-view-mode";

function getStoredView(): ViewMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "grid" || stored === "list") return stored;
  } catch {
    // localStorage unavailable
  }
  return "grid";
}

export function useViewPreference() {
  const [view, setViewState] = useState<ViewMode>(getStoredView);

  const setView = useCallback((mode: ViewMode) => {
    setViewState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // localStorage unavailable
    }
  }, []);

  return [view, setView] as const;
}
