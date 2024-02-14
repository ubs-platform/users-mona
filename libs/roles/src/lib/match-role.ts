export function matchRoles(roles: string[], userRoles: string[]): boolean {
  return  roles.reduce((a, b) => a || userRoles.includes(b), false) ;
}