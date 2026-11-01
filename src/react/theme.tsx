import { createContext, useContext, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AccentName } from '../tokens/accents.ts';
import { resolveTokens } from '../tokens/resolve.ts';
import { DEFAULT_THEME_ID, themeById } from '../tokens/themes.ts';
import type { Character, DeviceClass, Theme, Tokens } from '../tokens/types.ts';
import { applyTheme } from '../web/theme.ts';

const TokensContext = createContext<Tokens>(resolveTokens(themeById(DEFAULT_THEME_ID)!));

export interface ThemeProviderProps {
  /** A built-in theme id or a theme object. */
  theme: Theme | string;
  deviceClass?: DeviceClass;
  character?: Partial<Character>;
  accent?: AccentName | 'default';
  /** Apply to `<html>` (default) or to a wrapping `<div>` (several themes on one page). */
  scope?: 'document' | 'local';
  className?: string;
  children?: ReactNode;
}

/** Applies a theme (as `applyTheme` does) and provides its resolved tokens to `useTokens()`. */
export function ThemeProvider({ theme, deviceClass, character, accent, scope = 'document', className, children }: ThemeProviderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tokens, setTokens] = useState<Tokens>(() => resolveTokens(typeof theme === 'string' ? (themeById(theme) ?? themeById(DEFAULT_THEME_ID)!) : theme, deviceClass));
  // One string for every input, so callers can pass fresh objects each render without re-applying.
  const key = useMemo(() => JSON.stringify([theme, deviceClass, character, accent, scope]), [theme, deviceClass, character, accent, scope]);
  useLayoutEffect(() => {
    const target = scope === 'local' ? ref.current : document.documentElement;
    if (target) setTokens(applyTheme(theme, { deviceClass, character, accent }, target));
    // `key` stands for every input.
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <TokensContext.Provider value={tokens}>
      {scope === 'local' ? (
        <div ref={ref} className={className ? `mh-root ${className}` : 'mh-root'}>
          {children}
        </div>
      ) : (
        children
      )}
    </TokensContext.Provider>
  );
}

/** The resolved tokens of the nearest `ThemeProvider` (for values CSS can't reach: canvas drawing, charts). */
export function useTokens(): Tokens {
  return useContext(TokensContext);
}
