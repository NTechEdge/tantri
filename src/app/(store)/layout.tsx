import React, { Suspense } from 'react';
import { StoreProvider } from '@/components/store/StoreProvider';
import { StoreShell } from '@/components/store/StoreShell';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <Suspense fallback={null}>
        <StoreShell>{children}</StoreShell>
      </Suspense>
    </StoreProvider>
  );
}
