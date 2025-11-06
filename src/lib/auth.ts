const PASSWORD = 'iWorld007xzaidali@';
const REMEMBER_ME_KEY = 'pos_remember_me';
const AUTH_KEY = 'pos_authenticated';

export const authService = {
  validatePassword(password: string): boolean {
    return password === PASSWORD;
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check if remember me is enabled
    const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
    if (rememberMe) {
      return localStorage.getItem(AUTH_KEY) === 'true';
    }
    
    // Check session storage for non-remember me sessions
    return sessionStorage.getItem(AUTH_KEY) === 'true';
  },

  login(password: string, rememberMe: boolean = false): boolean {
    if (!this.validatePassword(password)) {
      return false;
    }

    if (rememberMe) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
      localStorage.setItem(AUTH_KEY, 'true');
    } else {
      sessionStorage.setItem(AUTH_KEY, 'true');
    }

    return true;
  },

  logout(): void {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
    sessionStorage.removeItem(AUTH_KEY);
  },
};

