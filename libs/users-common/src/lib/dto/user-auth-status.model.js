"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAuthFail = exports.UserAuthSuccess = void 0;
class UserAuthSuccess {
    constructor(token) {
        this.token = token;
        this.success = true;
        this.message = 'User login is success';
    }
}
exports.UserAuthSuccess = UserAuthSuccess;
class UserAuthFail {
    constructor() {
        this.success = false;
        this.message = 'Username or Password is wrong';
    }
}
exports.UserAuthFail = UserAuthFail;
//# sourceMappingURL=user-auth-status.model.js.map