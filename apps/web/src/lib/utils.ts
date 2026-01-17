import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Snippet } from 'svelte';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export type WithElementRef<T, E extends HTMLElement = HTMLElement> = T & {
  ref?: E | null;
};

export type WithoutChildrenOrChild<T> = T extends { children?: Snippet; child?: Snippet }
  ? Omit<T, 'children' | 'child'>
  : T extends { children?: Snippet }
    ? Omit<T, 'children'>
    : T extends { child?: Snippet }
      ? Omit<T, 'child'>
      : T;

export type WithoutChild<T> = T extends { child?: Snippet } ? Omit<T, 'child'> : T;

export type WithoutChildren<T> = T extends { children?: Snippet } ? Omit<T, 'children'> : T;
