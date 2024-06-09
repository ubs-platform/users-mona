export interface UserFullDto {
  _id?: any;

  username: string;

  primaryEmail: string;

  name: string;

  surname: string;

  country: string;

  state: string;

  city: string;

  district: string;

  gender: string;

  pronounce: string;

  roles: string[];

  webSites: string[];

  active: boolean;

  suspended: boolean;

  suspendReason: string;

  password?: string;
  localeCode: string;
}
