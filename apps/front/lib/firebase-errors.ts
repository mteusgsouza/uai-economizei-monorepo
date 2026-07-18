import { FirebaseError } from "firebase/app";

// Cancelamento de popup pelo usuário: não exibir toast de erro
export const SILENT_AUTH_ERROR_CODES = new Set([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
]);

export function firebaseErrorMessage(error: FirebaseError): string {
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
    case "auth/user-disabled":
      return "Esta conta foi desativada";
    default:
      return "Erro ao autenticar. Tente novamente";
  }
}
