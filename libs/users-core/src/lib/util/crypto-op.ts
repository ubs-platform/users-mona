import { SECRET_PW } from '@ubs-platform/jwt-consts';
import { hash, cipher, decipher } from 'crypto-promise';

export class CryptoOp {
  public static async encrypt(passwd: string): Promise<string> {
    return (await cipher('aes256', SECRET_PW)(passwd)).toString('hex');
  }
}
