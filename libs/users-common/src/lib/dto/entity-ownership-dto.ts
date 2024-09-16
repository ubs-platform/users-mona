export class UserCapabilityDTO {
  userId: string;
  capability: string;
  fromParent: boolean;
  // canEdit: boolean;
  // canRemove: boolean;
  // canView: boolean;
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
