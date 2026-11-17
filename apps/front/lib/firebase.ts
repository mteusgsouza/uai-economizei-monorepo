import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

/**
 * Projeto Firebase que autentica os clientes — um por loja.
 *
 * Vem de env porque é a única identidade que o código não consegue ler do
 * banco: o `AuthProvider` roda no browser, antes de qualquer requisição ao
 * Payload. Cada deploy (um projeto Vercel por loja) aponta para o seu.
 *
 * Os valores precisam ser referenciados um a um, sem índice dinâmico: o Next
 * substitui `process.env.NEXT_PUBLIC_*` no build por análise estática, e
 * `env[chave]` não é substituído — viraria `undefined` no bundle.
 *
 * Nada é obrigatório aqui de propósito. Sem as chaves o site inteiro continua
 * navegável e só o login falha, com erro do próprio Firebase no console; fazer
 * este módulo lançar derrubaria a vitrine, porque ele é importado pelo layout.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    "[auth] Firebase não configurado: defina NEXT_PUBLIC_FIREBASE_API_KEY e NEXT_PUBLIC_FIREBASE_PROJECT_ID. O login não vai funcionar.",
  );
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
