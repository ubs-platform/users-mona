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
  parent: EntityOwnershipSearch;
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
  capabilityName: String;
  userId: string;
}
