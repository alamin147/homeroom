export type AppErrorCode =
  | "NOT_FOUND"
  | "INVALID_INPUT"
  | "STORAGE_UNAVAILABLE"
  | "PROVIDER_UNAVAILABLE";

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function toSafeMessage(error: unknown): string {
  return error instanceof AppError ? error.message : "Something went wrong. Please try again.";
}
