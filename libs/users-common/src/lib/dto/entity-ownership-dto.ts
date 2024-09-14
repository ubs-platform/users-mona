export class UserCapability {
  userId: string;
  capability: string;
  // canEdit: boolean;
  // canRemove: boolean;
  // canView: boolean;
}

export interface EntityOwnershipDTO {
  userCapabilities: UserCapability[];
  entityGroup: String;
  entityName: String;
  entityId: String;
  fileUploadMaxLengthBytes: String;
  fileUploadAllowedFormats: String[];
  overriderRoles: String[];
  parent?: EntityOwnershipSearch;
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
