export const isTokenExpired = (): boolean => {
  const tokenExpires = localStorage.getItem('token_expires');
  
  if (!tokenExpires) {
    return true; // If no expiration is stored, consider it expired
  }
  
  const expirationDate = new Date(tokenExpires);
  const now = new Date();
  
  return now > expirationDate;
};

export const isRememberMeEnabled = (): boolean => {
  return localStorage.getItem('remember_me') === 'true';
};

export const clearAuthData = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  localStorage.removeItem('remember_me');
  localStorage.removeItem('token_expires');
};

export const setAuthData = (token: string, user: any, rememberMe: boolean = false): void => {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  if (rememberMe) {
    localStorage.setItem('remember_me', 'true');
    // Set token expiration to 30 days from now
    const expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    localStorage.setItem('token_expires', expirationDate.toISOString());
  } else {
    localStorage.removeItem('remember_me');
    // Set token expiration to 7 days from now (default)
    const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('token_expires', expirationDate.toISOString());
  }
};

export const hasValidAuthData = (): boolean => {
  const token = localStorage.getItem('auth_token');
  return token !== null && !isTokenExpired();
};