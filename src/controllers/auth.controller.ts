import type { Request, Response } from "express";
import type { AuthService } from "../services/auth.service";
import { UnauthorizedError } from "../errors/HttpError";
export function createAuthController(service: AuthService) {
  return {
    async register(request: Request, response: Response) { response.status(201).json(await service.register(request.body)); },
    async login(request: Request, response: Response) { response.status(200).json(await service.login(request.body)); },
    async me(request: Request, response: Response) {
      if (!request.user) throw new UnauthorizedError();
      response.status(200).json(await service.me(request.user));
    },
  };
}
