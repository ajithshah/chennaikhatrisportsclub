import { auth } from "../firebase";

// fetch() that attaches the signed-in user's Firebase ID token.
export async function authFetch(url, options = {}) {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(url, { ...options, headers });
}
