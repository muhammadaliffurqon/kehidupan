"use client";

import { useState } from "react";

export function getStorage(key, defaultValue) {
  if (typeof window === "undefined") return defaultValue;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorage(key, value) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => getStorage(key, defaultValue));

  const setValueSafe = (newValue) => {
    setStorage(key, newValue);
    setValue(newValue);
  };

  return [value, setValueSafe];
}
