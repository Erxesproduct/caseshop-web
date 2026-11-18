"use client";

import { useSyncExternalStore } from "react";

/** The phone the visitor told us they have («Миний утас»), kept in this browser only. */
export type MyPhone = { brand: string; brandName: string; model: string | null; modelName: string | null };

const KEY = "caseshop.phone.v1";
const listeners = new Set<() => void>();
let cache: MyPhone | null | undefined;

function read(): MyPhone | null {
  if (cache !== undefined) return cache;
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
    cache = v && typeof v.brand === "string" ? (v as MyPhone) : null;
  } catch {
    cache = null;
  }
  return cache;
}

export function setMyPhone(p: MyPhone | null) {
  cache = p;
  try {
    if (p) window.localStorage.setItem(KEY, JSON.stringify(p));
    else window.localStorage.removeItem(KEY);
  } catch {
    /* storage blocked: remembered for this page view only */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export const useMyPhone = () =>
  useSyncExternalStore(
    subscribe,
    () => read(),
    () => null,
  );

export const phoneHref = (p: MyPhone) => (p.model ? `/shop?b=${p.brand}&m=${p.model}` : `/shop?b=${p.brand}`);
export const phoneLabel = (p: MyPhone) => (p.modelName ? p.modelName : p.brandName);
