// Identidade do domínio: nenhum tipo HTTP nesta camada.
export type Role = "admin" | "profissional" | "recepcao";
export type User = { id: number; name: string; role: Role };
