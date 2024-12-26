import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
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
import { ClientKafka } from '@nestjs/microservices';
import { EmailDto } from '../dto/email.dto';
import { randomUUID } from 'crypto';
import { EmailService } from './email.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    // @Inject('KAFKA_CLIENT') private client: ClientKafka,
    private emailService: EmailService
  ) {
    this.initOperation();
  }

  async activateUserByKey(key: string) {
    const u = await this.userModel.findOne({ activationKey: key }).exec();
    u.active = true;
    u.activationKey = null;
    u.activationExpireDate = null;
    await u.save();
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

  async changePasswordLogged(id: string, pwChange: PasswordChangeDto) {
    const u = await this.userModel.findById(id);

    if (u) {
      if (
        u.passwordEncyripted !=
        (await CryptoOp.encrypt(pwChange.currentPassword))
      ) {
        throw 'password-does-not-match';
      } else {
        u.passwordEncyripted = await CryptoOp.encrypt(pwChange.newPassword);
        await u.save();
        await this.sendPasswordChangedMail(u);
        return UserMapper.toAuthDto(u);
      }
    } else {
      throw 'not-found';
    }
  }

  async changePasswordForgor(id: string, newPassword: string) {
    const u = await this.userModel.findById(id);

    if (u) {
      u.passwordEncyripted = await CryptoOp.encrypt(newPassword);
      await u.save();
      await this.sendPasswordChangedMail(u);
      return UserMapper.toAuthDto(u);
    } else {
      throw 'not-found';
    }
  }

  async sendPasswordChangedMail(u: User) {
    this.sendEmail(u, 'ubs-pwreset-changed-short', 'ubs-pwreset-changed');
  }

  async sendRegisteredEmail(u: User, key: string, origin = '') {
    const link =
      origin +
      process.env['U_USERS_REGISTERED_USER_VALIDATING_URL'].replace(
        ':key',
        key
      );
    this.sendEmail(u, 'ubs-user-registered-short', 'ubs-user-registered', {
      link,
    });
  }

  async sendEmail(
    u: User,
    subject: string,
    templateName: string,
    specialVariables: { [key: string]: any } = {}
  ) {
    this.emailService.sendEmail(u, subject, templateName, specialVariables);
  }

  async saveNewUser(user: UserCreateDTO & { id?: string }) {
    await this.assertUserInfoValid(user);
    const u = new this.userModel();
    await UserMapper.createFrom(u, user);
    await u.save();

    return UserMapper.toAuthDto(u);
  }

  async changeEmail(userId: any, newEmail: string) {
    const user = await this.userModel.findById(userId);
    user!.primaryEmail = newEmail;
    await user!.save();
    return UserMapper.toAuthDto(user);
  }

  async registerUser(user: UserRegisterDTO, origin?: string) {
    await this.assertUserInfoValid(user);
    if (!user.password) {
      throw new ErrorInformations(
        UBSUsersErrorConsts.EMPTY_DATA,
        'password-is-missing.'
      );
    }
    const u = new this.userModel();
    await UserMapper.registerFrom(u, user);
    u.activationKey = randomUUID();
    const date = new Date();
    date.setDate(date.getDate() + 7);
    u.activationExpireDate = date;
    await u.save();
    await this.sendRegisteredEmail(u, u.activationKey, origin);
  }

  async enableUser(activationKey: string) {
    if (activationKey) {
      const u = await this.userModel.findOne({ activationKey });
      u.active = true;
      u.activationKey = null;
      u.save();
    }
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
    if (u && u.active && !u.suspended) {
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

  async findById(id: ObjectId | string) {
    return UserMapper.toFullDto(await this.userModel.findById(id));
  }

  async editUserFullInformation(data: UserFullDto) {
    if (
      (await this.findByEmailExcludeUserId(data.primaryEmail, data._id)).length
    ) {
      throw 'email-is-using-already';
    }
    const user = await this.userModel.findById(data._id);
    console.info(user);
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
        username: process.env['UBS_USERS_INITIAL_USERNAME'] || 'kyle',
        password: process.env['UBS_USERS_INITIAL_PW'] || 'kyle',
        primaryEmail:
          process.env['UBS_USERS_INITIAL_EMAIL'] || 'main@localhost',
        name: process.env['UBS_USERS_INITIAL_NAME'] || 'Kyle',
        surname: process.env['UBS_USERS_INITIAL_SURNAME'] || 'Broflovski',
        active: true,
        roles: ['ADMIN'],
      } as UserCreateDTO;
      await this.saveNewUser(user);
      if (user.name == 'Kyle' && user.surname == 'Broflovski') {
        console.warn(
          'We suppose that you are Kip Drordy, you are so alone and have social anxiety. So admin user "Kyle Broflovski" has been added for emotional support. Please see the following output\n',
          "Don't forget to change these informations before production."
        );
      } else {
        console.warn(
          'Initial user has been added. Please see the following output',
          "Don't forget to change these informations before production."
        );
      }
      console.info(user);
      // }
    }
  }
}
