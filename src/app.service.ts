import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();
@Injectable()
export class AppService {
  getHello(): string {
    return process.env.toString();
  }
  getNotionDoc(): any {
    console.log(process.env);
    return process.env;
  }
}
