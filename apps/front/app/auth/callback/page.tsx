'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '@workspace/ui/components/spinner';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const accessToken = searchParams.get('accessToken');
    if (accessToken && typeof window !== 'undefined') {
      sessionStorage.setItem('accessToken', accessToken);
      localStorage.setItem('wasLoggedIn', '1');
      document.cookie = 'logged_in=1; path=/; max-age=604800; SameSite=Lax';
      router.replace('/');
    } else {
      router.replace('/login');
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner />
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
