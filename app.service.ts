import { Injectable } from '@nestjs/common';
let currentDate = new Date();

@Injectable()
export class AppService {
  getHello(): any {
    let myJSON = {};
    myJSON["message"] = "Welcome to Channel Microservice"
    myJSON["env"] = process.env.NODE_ENV
    myJSON["Deployment-Date"] = currentDate;
    return myJSON;
  }
}
