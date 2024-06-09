export interface UserAuthBackendDTO {
  username: string;
  primaryEmail: string;
  name: string;
  surname: string;
  id: string;
  suspended: boolean;
  suspendReason: string;
  roles: string[];
  localeCode: string;
  active: boolean;
}
