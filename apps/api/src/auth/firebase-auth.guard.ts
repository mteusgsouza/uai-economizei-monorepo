import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { getAuth } from "firebase-admin/auth";
import { IS_PUBLIC_KEY } from "./public.decorator";

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing or invalid token");
    }

    const idToken = authHeader.split("Bearer ")[1];

    try {
      const decodedToken = await getAuth().verifyIdToken(idToken);

      (request as any).firebaseUser = decodedToken;
      (request as any).firebaseUid = decodedToken.uid;

      return true;
    } catch (error: any) {
      throw new UnauthorizedException(
        `Invalid Firebase token: ${error.message}`
      );
    }
  }
}
