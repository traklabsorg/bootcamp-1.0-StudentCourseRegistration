// import { Injectable } from '@nestjs/common';
// import { MailerService } from '@nestjs-modules/mailer';
// const nodemailer = require('nodemailer');

// @Injectable()
// export class ExampleService {
//   constructor(private readonly mailerService: MailerService) {}
  
//   public example(): void {
//       console.log("Inside Example...");
//       let transport = nodemailer.createTransport({
//         service: 'smtp.gmail.com',
//         port: 465,
//         secure: false,
//         auth: {
//         user: '15103140ashish@gmail.com',
//         pass: 'xyz'
//         }
//         });
//         transport.
//       this
//       .mailerService
//       .sendMail({
//         to: 'test@nestjs.com', // list of receivers
//         from: 'noreply@nestjs.com', // sender address
//         subject: 'Testing Nest MailerModule ✔', // Subject line
//         text: 'welcome', // plaintext body
//         html: '<b>welcome</b>', // HTML body content
//       })
//       .then(() => {})
//       .catch((err) => {
//           console.log("Error is...."+JSON.stringify(err))
//       });
//   }
// }