import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../domain/user.model';
// const Cyripto = require("crypto-promise")
import { UserMapper } from '../mapper/user.mapper';
import { CryptoOp } from '../util/crypto-op';
import {
  UserGeneralInfoDTO,
  PasswordChangeDto,
  UserCreateDTO,
  UserRegisterDTO,
  UserDTO,
  UserAuth,
  UserFullDto,
  UserAuthBackendDTO,
  ErrorInformations,
  UBSUsersErrorConsts,
} from '@ubs-platform/users-common';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {
    this.initOperation();
  }

  async fetchAllUsers() {
    return (await this.userModel.find()).map((a) =>
      UserMapper.toAuthBackendDto(a)
    );
  }

  async fetchUserGeneralInformation(user: UserGeneralInfoDTO) {
    const userExist = await this.userModel.findById(user.id);
    console.info(userExist);
    if (userExist) {
      return UserMapper.toGeneralDto(userExist);
    } else {
      throw 'not.found';
    }
  }

  async changePassword(id: string, pwChange: PasswordChangeDto) {
    const u = await this.userModel.findById(id);

    if (u) {
      if (
        u.passwordEncyripted !=
        (await CryptoOp.encrypt(pwChange.currentPassword))
      ) {
        throw 'password-does-not-match';
      } else {
        u.passwordEncyripted = await CryptoOp.encrypt(pwChange.newPassword);
        u.save();
        return UserMapper.toAuthDto(u);
      }
    } else {
      throw 'not-found';
    }
  }

  async saveNewUser(user: UserCreateDTO & { id?: string }) {
    await this.assertUserInfoValid(user);
    let u = new this.userModel();
    await UserMapper.createFrom(u, user);
    await u.save();

    return UserMapper.toAuthDto(u);
  }

  async changeEmail(userId: any, newEmail: string) {
    let user = await this.userModel.findById(userId);
    user!.primaryEmail = newEmail;
    await user!.save();
    return UserMapper.toAuthDto(user);
  }

  async registerUser(user: UserRegisterDTO) {
    await this.assertUserInfoValid(user);
    if (!user.password) {
      throw new ErrorInformations(
        UBSUsersErrorConsts.EMPTY_DATA,
        'password-is-missing.'
      );
    }
    const u = new this.userModel();
    await UserMapper.registerFrom(u, user);
    await u.save();
  }

  private async assertUserInfoValid(
    user: UserDTO | UserCreateDTO | UserRegisterDTO
  ) {
    if (!user || !user.username || !user.primaryEmail) {
      throw new ErrorInformations(
        UBSUsersErrorConsts.EMPTY_DATA,
        'One or More Required informations are empty.'
      );
    }

    const userWithUsername = await this.findByUsername(user.username);
    if (userWithUsername.length) {
      throw new ErrorInformations(
        UBSUsersErrorConsts.EXIST_USERNAME,
        'User with that username is exist.'
      );
    }

    const userWithPrimaryMail = await this.findByEmail(user.primaryEmail);
    if (userWithPrimaryMail.length) {
      throw new ErrorInformations(
        UBSUsersErrorConsts.EXIST_PRIMARY_MAIL,
        'User with that primary mail is exist.'
      );
    }
  }

  async findUserByLogin(userLogin: UserAuth): Promise<UserDTO> {
    let realUser: UserDTO;
    const userUname = await this.findByUsername(userLogin.login);
    if (userUname.length) {
      realUser = userUname[0];
    } else {
      const userEmail = await this.findByEmail(userLogin.login);
      if (userEmail.length) {
        realUser = userEmail[0];
      }
    }
    return realUser;
  }

  async findUserByLoginAndPw(userLogin: UserAuth): Promise<UserDTO> {
    let realUser: UserDTO;
    const pwHash = await CryptoOp.encrypt(userLogin.password);

    const userUname = await this.findByUsernamePwHash(userLogin.login, pwHash);
    if (userUname.length) {
      realUser = userUname[0];
    } else {
      const userEmail = await this.findByEmailPwHash(userLogin.login, pwHash);
      if (userEmail.length) {
        realUser = userEmail[0];
      }
    }
    return realUser;
  }

  async findByEmail(primaryEmail: string): Promise<UserDTO[]> {
    return await this.userModel.find({
      primaryEmail: primaryEmail,
    });
  }

  async findByEmailExcludeUserId(
    primaryEmail: string,
    userIdExclude: any
  ): Promise<UserDTO[]> {
    return await this.userModel.find({
      primaryEmail: primaryEmail,
      _id: {
        $ne: userIdExclude,
      },
    });
  }

  async findByUsername(username: string): Promise<UserDTO[]> {
    const us = await this.userModel.find({
      username: username,
    });
    return UserMapper.toDtoList(us);
  }

  private async findByEmailPwHash(
    primaryEmail: string,
    pwHash: string
  ): Promise<UserDTO[]> {
    return await this.userModel.find({
      primaryEmail: primaryEmail,
      passwordEncyripted: pwHash,
    });
  }

  private async findByUsernamePwHash(
    username: string,
    pwHash: string
  ): Promise<UserDTO[]> {
    const us = await this.userModel.find({
      username: username,
      passwordEncyripted: pwHash,
    });
    return UserMapper.toDtoList(us);
  }

  async removeRole(userId: string, role: string): Promise<void> {
    const u = await this.userModel.findById(userId);
    const roleIndex = u.roles.indexOf(role);
    if (roleIndex > -1) {
      u.roles.splice(roleIndex, 1);
      await u.save();
    }
  }

  async insertRole(userId: string, role: string): Promise<void> {
    const u = await this.userModel.findById(userId);
    if (!u.roles.includes(role)) {
      u.roles.push(role);
      await u.save();
    }
  }

  async hasUserRoleAtLeastOneOrAdmin(
    userId: string,
    role: string
  ): Promise<boolean> {
    return (
      (await this.userModel.countDocuments({
        id: userId,
        roles: ['ADMIN', role],
      })) > 0
    );
  }

  async findFullInfo(id: any): Promise<UserFullDto> {
    return UserMapper.toFullDto(await this.userModel.findById(id));
  }

  async findUserAuth(id: any): Promise<UserDTO> {
    return UserMapper.toAuthDto(await this.userModel.findById(id));
  }

  async findUserAuthBackend(id: any): Promise<UserAuthBackendDTO | null> {
    const u = await this.userModel.findById(id);
    if (u.active && !u.suspended) {
      return UserMapper.toAuthBackendDto(u);
    } else {
      return null;
    }
  }

  async addUserFullInformation(data: UserFullDto) {
    if (
      (await this.findByEmail(data.primaryEmail)).length ||
      (await this.findByUsername(data.username)).length
    ) {
      throw 'email-is-using-already';
    }
    // if (user.roles.includes('ADMIN')) {
    //   data.roles = ['ADMIN'];
    //   data.active = true;
    //   data.suspended = false;
    // }
    const user = new this.userModel();
    await UserMapper.userFullFromUser(user, data);
    await user.save();
    UserMapper.toAuthDto(user);
  }

  async editUserFullInformation(data: UserFullDto) {
    if (
      (await this.findByEmailExcludeUserId(data.primaryEmail, data._id)).length
    ) {
      throw 'email-is-using-already';
    }
    const user = await this.userModel.findById(data._id);
    console.info(user);
    // if (user.roles.includes('ADMIN')) {
    //   data.roles = ['ADMIN'];
    //   data.active = true;
    //   data.suspended = false;
    // }
    if (user) {
      await UserMapper.userFullFromUser(user, data);
      await user.save();
      UserMapper.toAuthDto(user);
    } else {
      throw 'not.found';
    }
  }

  async editUserGeneralInformation(data: UserGeneralInfoDTO, id: any) {
    const user = await this.userModel.findById(id);
    console.info(user);
    if (user) {
      UserMapper.userFromGeneralInfo(user, data);

      await user.save();
      UserMapper.toAuthDto(user);
    } else {
      throw 'not.found';
    }
  }

  async deleteUser(id: any) {
    const user = await this.userModel.findById(id);
    if (user) {
      // UserMapper.userFromGeneralInfo(user, data);
      await user.deleteOne();
      return UserMapper.toGeneralDto(user);
      // UserMapper.toAuthDto(user);
    } else {
      return null;
    }
  }

  async initOperation() {
    const count = await this.userModel.countDocuments();
    if (count == 0) {
      const user = {
        username: 'kyle',
        password: 'kyle',
        primaryEmail: 'main@localhost',
        name: 'Kyle',
        surname: 'Broflovski',
        active: true,
        roles: ['ADMIN'],
      } as UserCreateDTO;
      await this.saveNewUser(user);
      console.warn(
        'We suppose that you are Kip Drordy, you are so alone and have social anxiety. So admin user "Kyle Broflovski" has been added for emotional support.\n',
        'username: "kyle"\n',
        'password: "kyle"',
        "Don't forget to change these informations before production."
      );
      // }
    }
  }
}
