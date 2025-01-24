import {
  UserCreateDTO,
  UserRegisterDTO,
  UserGeneralInfoDTO,
  UserFullDto,
  UserDTO,
  UserAuthBackendDTO,
} from '@ubs-platform/users-common';
import { User } from '../domain/user.model';
import { CryptoOp } from '../util/crypto-op';

export class UserMapper {
  static lowerCased(i?: string) {
    return i?.toLowerCase().trim();
  }

  static async createFrom(u: User, user: UserCreateDTO): Promise<User> {
    u.active = user.active;
    u.username = this.lowerCased(user.username);
    u.primaryEmail = this.lowerCased(user.primaryEmail);
    if (user.password) {
      u.passwordEncyripted = await CryptoOp.encrypt(user.password);
    }

    u.roles = user.roles;
    u.name = user.name;
    u.surname = user.surname;
    u.localeCode = user.localeCode;
    return u;
  }

  static async registerFrom(entity: User, dto: UserRegisterDTO): Promise<User> {
    // entity.active = true;

    entity.username = this.lowerCased(dto.username);
    entity.primaryEmail = this.lowerCased(dto.primaryEmail);
    entity.passwordEncyripted = await CryptoOp.encrypt(dto.password);
    entity.name = dto.name;
    entity.surname = dto.surname;
    entity.localeCode = dto.localeCode;
    console.info(entity);
    return entity;
  }

  static userFromGeneralInfo(
    entity: User,
    generaldto: UserGeneralInfoDTO
  ): User {
    entity.name = generaldto.name;
    entity.surname = generaldto.surname;
    entity.gender = generaldto.gender;
    entity.city = generaldto.city;
    entity.district = generaldto.district;
    entity.state = generaldto.state;
    entity.country = generaldto.country;
    entity.localeCode = generaldto.localeCode;
    entity.pronounce = generaldto.pronounce;
    // username and id is passed
    return entity;
  }

  static async userFullFromUser(user: User, data: UserFullDto): Promise<User> {
    if (data.password) {
      user.passwordEncyripted = await CryptoOp.encrypt(data.password);
    }
    user.name = data.name;
    user.surname = data.surname;
    user.username = this.lowerCased(data.username);
    user.primaryEmail = this.lowerCased(data.primaryEmail);
    user.gender = data.gender;
    user.city = data.city;
    user.district = data.district;
    user.state = data.state;
    user.country = data.country;
    user.pronounce = data.pronounce;
    user.roles = data.roles;
    user.suspended = data.suspended;
    user.suspendReason = data.suspendReason;
    user.active = data.active;
    user.localeCode = data.localeCode;
    user.webSites = data.webSites;
    user._id = data._id;
    return user;
  }

  static toFullDto(data: User): UserFullDto {
    return {
      name: data.name,
      surname: data.surname,
      username: this.lowerCased(data.username),
      primaryEmail: this.lowerCased(data.primaryEmail),
      gender: data.gender,
      city: data.city,
      district: data.district,
      state: data.state,
      country: data.country,
      pronounce: data.pronounce,
      roles: data.roles,
      suspended: data.suspended,
      suspendReason: data.suspendReason,
      active: data.active,
      webSites: data.webSites,
      localeCode: data.localeCode,
      _id: data._id,
    };
  }

  static toAuthDto(ub?: User): UserDTO | null {
    if (ub == null) return null;
    return {
      username: this.lowerCased(ub.username),
      name: ub.name,
      surname: ub.surname,
      primaryEmail: this.lowerCased(ub.primaryEmail),
      active: ub.active,
      id: ub._id,
      suspended: ub.suspended,
      localeCode: ub.localeCode,
      suspendReason: ub.suspendReason,
    } as UserDTO;
  }

  static toAuthBackendDto(ub: User): UserAuthBackendDTO | null {
    return {
      username: this.lowerCased(ub.username),
      roles: ub.roles,
      name: ub.name,
      surname: ub.surname,
      primaryEmail: this.lowerCased(ub.primaryEmail),
      active: ub.active,
      id: ub._id,
      suspended: ub.suspended,
      localeCode: ub.localeCode,
      suspendReason: ub.suspendReason,
    } as UserAuthBackendDTO;
  }

  static toGeneralDto(ub?: User): UserGeneralInfoDTO {
    console.info(ub.gender);
    return {
      name: ub.name,
      surname: ub.surname,
      gender: ub.gender,
      webSites: ub.webSites,
      pronounce: ub.pronounce,
      localeCode: ub.localeCode,
      district: ub.district,
      state: ub.state,
      city: ub.city,
      country: ub.country,
      username: ub.username,
      id: ub._id,
    };
  }

  static toDtoList(ub?: User[]) {
    return ub.map((a) => this.toAuthDto(a));
  }
}
