// Tiny registry that lets the Apollo error link trigger auth recovery without
// importing the auth store — which would create a require cycle
// (useAuthStore → client → links → useAuthStore). The store registers its
// handlers here at init; this module imports nothing, so the cycle is broken.

export interface AuthActions {
  refresh: () => Promise<boolean>;
  signOut: () => Promise<void>;
}

let actions: AuthActions | null = null;

export function setAuthActions(next: AuthActions): void {
  actions = next;
}

export function getAuthActions(): AuthActions | null {
  return actions;
}
