"use client";

/**
 * Uploaded intake forms are kept in the browser's IndexedDB (localStorage is too small for files).
 * Production: these would go to file storage (e.g. Supabase Storage) instead.
 */
import { clear, createStore, get, set } from "idb-keyval";

let store: ReturnType<typeof createStore> | null = null;
function formStore() {
  store ??= createStore("tdc-intake-forms", "files");
  return store;
}

export async function saveFormFile(key: string, file: Blob) {
  await set(key, file, formStore());
}

export async function getFormFile(key: string): Promise<Blob | undefined> {
  return get<Blob>(key, formStore());
}

export async function clearFormFiles() {
  try {
    await clear(formStore());
  } catch {
    // IndexedDB unavailable: nothing to clear.
  }
}
