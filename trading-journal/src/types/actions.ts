export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export function ok(): ActionResult<void>;
export function ok<T>(data: T): ActionResult<T>;
export function ok<T>(data?: T): ActionResult<T | void> {
  return { success: true, data: data as T };
}

export function fail(error: string): ActionResult<never> {
  return { success: false, error };
}
