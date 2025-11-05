'use client';

import * as React from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';

export default function EmotionRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize Emotion cache once (per request on server), instrument insert to capture styles
  const [{ cache, flush }] = React.useState(() => {
    const cache = createCache({ key: 'css', prepend: true });
    // Enable compatibility mode for certain MUI integrations
    cache.compat = true;

    const prevInsert = cache.insert;
    let insertedNames: string[] = [];

    cache.insert = (...args: Parameters<typeof cache.insert>) => {
      const serialized = args[1] as { name: string };
      if (cache.inserted[serialized.name] === undefined) {
        insertedNames.push(serialized.name);
      }
      return prevInsert(...args);
    };

    const flush = () => {
      const prev = insertedNames;
      insertedNames = [];
      return prev;
    };

    return { cache, flush } as const;
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) return null;
    const css = names
      .map(name =>
        typeof cache.inserted[name] === 'string' ? cache.inserted[name] : ''
      )
      .join('');
    return (
      <style
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: css }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
