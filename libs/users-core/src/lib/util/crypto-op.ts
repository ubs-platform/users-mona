import { SECRET_PW } from '../util/consts';
import { hash, cipher, decipher } from 'crypto-promise';

export class CryptoOp {
  public static async encrypt(passwd: string): Promise<string> {
    return (await cipher('aes256', SECRET_PW)(passwd)).toString('hex');
  }
}
