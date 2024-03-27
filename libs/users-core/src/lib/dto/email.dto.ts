export interface EmailDto {
  to: string;
  subject: string;
  templateName: string;
  specialVariables: any;
  language?: string;
}
