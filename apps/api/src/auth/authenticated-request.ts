import type { Request } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';

/**
 * Request após o FirebaseAuthGuard: o guard anexa o token decodificado
 * e o uid. Use este tipo nos controllers em vez de `(req as any)`.
 */
export interface AuthenticatedRequest extends Request {
  firebaseUser?: DecodedIdToken;
  firebaseUid?: string;
}
