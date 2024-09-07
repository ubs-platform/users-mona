export interface EntityOwnershipDTO {
  userIds: String[];
  entityGroup: String;
  entityName: String;
  entityId: String;
  fileUploadMaxLengthBytes: String;
  fileUploadAllowedFormats: String[];
  capabilityName: String;
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
