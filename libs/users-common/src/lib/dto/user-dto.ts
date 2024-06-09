export interface UserDTO {
  username: string;
  primaryEmail: string;
  name: string;
  surname: string;
  id: string;
  suspended: boolean;
  suspendReason: string;
  active: boolean;
  localeCode: string;
}
