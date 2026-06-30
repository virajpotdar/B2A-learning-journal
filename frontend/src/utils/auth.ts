export type AuthUser = {
  id?: string;
  email: string;
  username?: string;
};

const AUTH_USER_KEY = 'learning-journal-auth-user';

export function getAuthUser(): AuthUser | null {
  const stored = localStorage.getItem(AUTH_USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuthUser(user: AuthUser | null) {
  if (!user) {
    localStorage.removeItem(AUTH_USER_KEY);
    return;
  }
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthUser() {
  localStorage.removeItem(AUTH_USER_KEY);
}
