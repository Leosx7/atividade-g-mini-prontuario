/**
 * ============================================================
 * A hierarquia de erros da API  (construída no Tópico 2)
 * ------------------------------------------------------------
 * Um erro HTTP carrega três informações:
 *   - statusCode: a semântica para a MÁQUINA (o cliente decide o
 *     que fazer olhando só o número);
 *   - message: a explicação para o HUMANO;
 *   - details: dados estruturados opcionais (ex.: lista de campos
 *     inválidos vinda do Zod).
 *
 * Quem LANÇA o erro (service) não sabe formatar HTTP.
 * Quem FORMATA (errorHandler) não sabe a regra de negócio.
 * Essa é a separação inteira, em duas frases.
 * ============================================================
 */
export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details: unknown = null,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string, details: unknown = null) {
    super(400, message, details);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message: string) {
    super(409, message);
  }
}

export class UnprocessableEntityError extends HttpError {
  constructor(message: string, details: unknown = null) {
    super(422, message, details);
  }
}

export class PayloadTooLargeError extends HttpError {
  constructor(message: string) {
    super(413, message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Autenticação necessária.") { super(401, message); }
}
export class ForbiddenError extends HttpError {
  constructor(message = "Você não tem permissão para esta ação.") { super(403, message); }
}
