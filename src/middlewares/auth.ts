import type { NextFunction, Request, Response, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { UnauthorizedError, ForbiddenError } from "../errors/HttpError";
import { roleSchema } from "../validation/auth.schemas";
import type { User, Role } from "../services/identity";
export type AuthenticatedUser = User;
declare global { namespace Express { interface Request { user?: User } } }
const identitySchema = z.object({ id: z.number().int().positive(), name: z.string().min(1), role: roleSchema });
export function requireAuth(secret: string): RequestHandler {
  return (request: Request, _response: Response, next: NextFunction) => {
    const match = /^Bearer ([^\s]+)$/.exec(request.headers.authorization ?? "");
    if (!match) throw new UnauthorizedError();
    try {
      // Só HS256; assinatura, expiração e formato do payload são verificados.
      const payload = jwt.verify(match[1]!, secret, { algorithms: ["HS256"] });
      const parsed = identitySchema.safeParse(payload);
      if (!parsed.success || typeof payload !== "object" || typeof payload.exp !== "number") throw new UnauthorizedError();
      request.user = parsed.data;
    } catch { throw new UnauthorizedError("Token inválido ou expirado."); }
    next();
  };
}
export function requireRole(...roles: Role[]): RequestHandler {
  return (request, _response, next) => {
    if (!request.user) throw new UnauthorizedError();
    if (!roles.includes(request.user.role)) throw new ForbiddenError();
    next();
  };
}
