export interface UserAuthStatus {
  success: boolean;
  message: string;
  token?: string;
}

export class UserAuthSuccess implements UserAuthStatus {
  constructor(public token?: string) {}
  success = true;
  message = 'User login is success';
}

export class UserAuthFail implements UserAuthStatus {
  success = false;
  message = 'Username or Password is wrong';
}
