export function matchRolesOrAdm(roles: string[], userRoles: string[]): boolean {
  return (
    userRoles.includes('ADMIN') ||
    roles.reduce((a, b) => a || userRoles.includes(b), false)
  );
}
