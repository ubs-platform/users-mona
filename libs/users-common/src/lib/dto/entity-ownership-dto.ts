export class UserCapabilityDTO {
  userId: string;
  capability: string;
}

export interface EntityOwnershipDTO {
  userCapabilities: UserCapabilityDTO[];
  entityGroup: String;
  entityName: String;
  entityId: String;
  overriderRoles: String[];
}

export interface EntityOwnershipInsertCapabiltyDTO {
  entityGroup: String;
  entityName: String;
  entityId: String;
  userId: string;
  capability: string;
}

export interface EntityOwnershipSearch {
  entityGroup: String;
  entityName: String;
  entityId: String;
}

export interface EntityOwnershipUserCheck {
  entityGroup: String;
  entityName: String;
  entityId: String;
  capability?: String;
  userId: string;
}
