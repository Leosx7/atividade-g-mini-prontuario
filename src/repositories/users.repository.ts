import type { User } from "../services/identity";
export type StoredUser = User & { email: string; passwordHash: string };
export interface UsersRepository {
  findByEmail(email: string): Promise<StoredUser | undefined>;
  findById(id: number): Promise<StoredUser | undefined>;
  create(input: Omit<StoredUser, "id">): Promise<StoredUser>;
}
