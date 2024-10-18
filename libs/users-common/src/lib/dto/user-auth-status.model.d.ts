export interface UserAuthStatus {
    success: boolean;
    message: string;
    token?: string;
}
export declare class UserAuthSuccess implements UserAuthStatus {
    token?: string;
    constructor(token?: string);
    success: boolean;
    message: string;
}
export declare class UserAuthFail implements UserAuthStatus {
    success: boolean;
    message: string;
}
