import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

interface SearchContextValue {
  open: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  focusTopicId: string | null;
  setFocusTopicId: (id: string | null) => void;
}

const SearchContext = createContext<SearchContextValue>({
  open: false,
  openSearch: () => {},
  closeSearch: () => {},
  focusTopicId: null,
  setFocusTopicId: () => {},
});

export const useSearch = () => useContext(SearchContext);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [focusTopicId, setFocusTopicId] = useState<string | null>(null);

  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <SearchContext.Provider
      value={{ open, openSearch, closeSearch, focusTopicId, setFocusTopicId }}
    >
      {children}
    </SearchContext.Provider>
  );
}
