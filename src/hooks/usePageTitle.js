import { useEffect } from 'react';

export function usePageTitle(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} · Dream Hair` : 'Dream Hair · The Curly Studio';
  }, [titulo]);
}
