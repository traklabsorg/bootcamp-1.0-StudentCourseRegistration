import { HttpModule, HttpService, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import StudentAppService from './appServices/studentAppService';
import { StudentFacade } from './facade/studentFacade';
import { RegistrationFacade } from './facade/registrationFacade';
import RegistrationAppService from './appServices/registrationAppService';
import CourseAppService from './appServices/courseAppService';
import { CourseFacade } from './facade/courseFacade';
import { StudentRoutes } from './routes/studentRoutes';
import { CourseRoutes } from './routes/courseRoutes';
import { RegistrationRoutes } from './routes/registrationRoutes';
import { Student } from 'submodules/platform-3.0-Entities/student';
import { Course } from 'submodules/platform-3.0-Entities/course';
import { Registration } from 'submodules/platform-3.0-Entities/registration';

@Module({
  imports: [HttpModule,
    TypeOrmModule.forFeature([ Student,Course,Registration]),
  ],
  providers: [RegistrationFacade,RegistrationAppService,CourseFacade,CourseAppService,StudentFacade,StudentAppService],
  controllers: [StudentRoutes,CourseRoutes,RegistrationRoutes]
})

export class EntityModule implements NestModule {
  constructor() {
    console.log("Inside Entity Module....");
  }

  configure(consumer: MiddlewareConsumer) {
    console.log("Inside Consumer baby......");
    // consumer
    //   .apply(AuthenticationMiddleware,AuthorizationMiddleware)
    //   .forRoutes({path:"/*",method:RequestMethod.ALL});
  }
}