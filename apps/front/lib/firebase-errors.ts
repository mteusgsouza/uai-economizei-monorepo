import { FirebaseError } from "firebase/app";

// Cancelamento de popup pelo usuário: não exibir toast de erro
export const SILENT_AUTH_ERROR_CODES = new Set([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
]);

/**
 * Mensagem para o cliente. O código do Firebase vai para o console junto — sem
 * ele, uma falha de configuração (domínio não autorizado, método desabilitado)
 * chega como "tente novamente" e não há o que investigar.
 */
export function firebaseErrorMessage(error: FirebaseError): string {
  if (!SILENT_AUTH_ERROR_CODES.has(error.code)) {
    console.error(`[auth] ${error.code}: ${error.message}`);
  }

  switch (error.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Email ou senha inválidos";
    case "auth/user-not-found":
      return "Usuário não encontrado";
    case "auth/email-already-in-use":
      return "Este email já está cadastrado";
    case "auth/weak-password":
      return "A senha deve ter pelo menos 6 caracteres";
    case "auth/invalid-email":
      return "Email inválido";
    case "auth/too-many-requests":
      return "Muitas tentativas. Tente novamente mais tarde";
    case "auth/network-request-failed":
      return "Erro de conexão. Verifique sua internet";
    case "auth/account-exists-with-different-credential":
      return "Este email já está cadastrado com outro método de login";
    case "auth/popup-blocked":
      return "O popup foi bloqueado pelo navegador. Permita popups e tente novamente";
    case "auth/operation-not-allowed":
      return "Método de login não habilitado. Contate o suporte";
    // O popup abre e fecha na hora: o domínio de onde o site está sendo servido
    // não está em Authentication → Settings → Authorized domains no Firebase.
    case "auth/unauthorized-domain":
      return "Este domínio não está autorizado para login. Contate o suporte";
    case "auth/user-disabled":
      return "Esta conta foi desativada";
    case "auth/invalid-action-code":
      return "Link inválido ou já utilizado";
    case "auth/expired-action-code":
      return "Link expirado. Solicite um novo";
    default:
      return "Erro ao autenticar. Tente novamente";
  }
}
