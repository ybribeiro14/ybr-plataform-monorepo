/** Use on all protected routes (requires valid JWT access token) */
export const BEARER_AUTH = [{ BearerAuth: [] }];

/** Use on public routes explicitly to document that no auth is required */
export const NO_AUTH: never[] = [];
