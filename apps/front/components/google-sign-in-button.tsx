'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { useAuth } from '@/lib/use-auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export function GoogleSignInButton() {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || !window.google || initializedRef.current) return;

    initializedRef.current = true;

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: async (response) => {
        try {
          await loginWithGoogle(response.credential);
          router.replace('/');
        } catch {
          toast.error('Falha ao autenticar com Google');
        }
      },
    });

    window.google.accounts.id.renderButton(containerRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      width: containerRef.current.offsetWidth || 300,
    });
  }, [loginWithGoogle, router]);

  if (!CLIENT_ID) {
    return null;
  }

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      <div ref={containerRef} className="w-full" />
    </>
  );
}
