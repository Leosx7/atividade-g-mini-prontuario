import { Router, type RequestHandler } from "express";
import type { createAuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { registerSchema, loginSchema } from "../validation/auth.schemas";
export function createAuthRouter(controller: ReturnType<typeof createAuthController>, authenticate: RequestHandler) {
  const router = Router();
  router.post("/register", validate(registerSchema), controller.register);
  router.post("/login", validate(loginSchema), controller.login);
  router.get("/me", authenticate, controller.me);
  return router;
}
