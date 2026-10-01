import { randomBytes } from "node:crypto";
import argon2 from "argon2";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { UsersRepository, StoredUser } from "../repositories/users.repository";
import type { LoginInput, RegisterInput } from "../validation/auth.schemas";
import type { User } from "./identity";
import { ConflictError, UnauthorizedError } from "../errors/HttpError";
function publicUser(user: StoredUser): User { return { id: user.id, name: user.name, role: user.role }; }
export class AuthService {
  // Negativa de e-mail inexistente também paga a verificação Argon2.
  private readonly dummyHash = argon2.hash(randomBytes(32), { type: argon2.argon2id });
  constructor(private readonly users: UsersRepository, private readonly secret: string, private readonly expiresIn: SignOptions["expiresIn"] = "15m") {
    if (secret.length < 32) throw new Error("Configure JWT_SECRET forte no .env antes de iniciar.");
  }
  async register(input: RegisterInput) {
    if (await this.users.findByEmail(input.email)) throw new ConflictError("Já existe um usuário com este e-mail.");
    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
    return publicUser(await this.users.create({ name: input.name, email: input.email, role: input.role, passwordHash }));
  }
  async login(input: LoginInput) {
    const user = await this.users.findByEmail(input.email);
    const valid = await argon2.verify(user?.passwordHash ?? await this.dummyHash, input.password);
    if (!user || !valid) throw new UnauthorizedError("Credenciais inválidas.");
    const identity = publicUser(user);
    const token = jwt.sign(identity, this.secret, { algorithm: "HS256", expiresIn: this.expiresIn });
    return { token, user: identity };
  }
  async me(identity: User) {
    const user = await this.users.findById(identity.id);
    if (!user) throw new UnauthorizedError();
    return publicUser(user);
  }
}
