import { z } from "zod";
const email = z.string().trim().toLowerCase().pipe(z.email());
export const roleSchema = z.enum(["admin", "profissional", "recepcao"]);
export const registerSchema = z.object({ name: z.string().trim().min(1), email, password: z.string().min(8), role: roleSchema });
// Login aceita senha curta: credencial errada é 401, não uma pista de política via 400.
export const loginSchema = z.object({ email, password: z.string() });
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
