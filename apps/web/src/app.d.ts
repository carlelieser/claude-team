// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { ElectronAPI } from './lib/ipc/client';

declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }

  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
