export const getRoles = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem("roles") || "[]");
  } catch {
    return [];
  }
};


export const hasRole = (requiredRoles: string | string[]): boolean => {
  const roles = getRoles();
  const required = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.some((role) => required.includes(role));
};
