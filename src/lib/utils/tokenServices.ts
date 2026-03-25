export const tokenService = {
  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  clear: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessTokenExpiresAt');
  },
  isAuthenticated: () => Boolean(localStorage.getItem('accessToken')),
  setExpiry: (expiresAt: number) => localStorage.setItem('accessTokenExpiresAt', String(expiresAt)),
  getExpiry: () => {
    const raw = localStorage.getItem('accessTokenExpiresAt');
    return raw ? Number(raw) : null;
  }
};
