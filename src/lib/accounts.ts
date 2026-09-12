// The app has exactly two accounts, so login asks for a password only: we try
// each known address against it and keep the one that authenticates. The
// addresses live in the env (comma-separated) rather than in source so the
// repo stays free of personal emails.
export const loginEmails = (process.env.EXPO_PUBLIC_LOGIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);
