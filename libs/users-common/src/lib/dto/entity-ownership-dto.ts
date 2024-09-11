export class UserCapability {
  userId: string;
  specialCapability: string;
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
  capabilityName: String;
  overriderRoles: String[];
}

export interface EntityOwnershipSearch {
  entityGroup: String;
  entityName: String;
  entityId: String;
  capabilityName: String;
}

export interface EntityOwnershipUserCheck {
  entityGroup: String;
  entityName: String;
  entityId: String;
  capabilityName: String;
  userId: string;
}
