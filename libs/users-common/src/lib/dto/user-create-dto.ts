/**
 * ‼️‼️ do not use in frontend ‼️‼️
 */
export interface UserCreateDTO {
  username: string;
  password: string;
  primaryEmail: string;
  name: string;
  surname: string;
  active: boolean;
  // id: string;
  localeCode: string;
  roles: Array<string>;
}
