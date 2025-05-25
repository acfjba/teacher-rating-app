let loginAttempts = 0;
const MAX_ATTEMPTS = 30;

export function allowLogin() {
  loginAttempts++;
  if (loginAttempts > MAX_ATTEMPTS) {
    alert("Too many login attempts. Please refresh the page.");
    location.reload(); // auto-refresh to reset
    return false;
  }
  return true;
}
