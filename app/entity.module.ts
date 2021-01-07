import { HttpModule, HttpService, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
// import { ProductService } from './product.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from 'submodules/platform-3.0-Entities/channel';
import { ChannelBillPlan } from 'submodules/platform-3.0-Entities/channelBillPlan';
import { Group } from 'submodules/platform-3.0-Entities/group';
import { GroupUser } from 'submodules/platform-3.0-Entities/groupUser';
import { MeetingProvider } from 'submodules/platform-3.0-Entities/meetingProvider';
import { Plan } from 'submodules/platform-3.0-Entities/plan';
import { User } from 'submodules/platform-3.0-Entities/user';
import { UserMeetingProvider } from 'submodules/platform-3.0-Entities/userMeetingProvider';
import { UserMeetingProviders_Meeting } from 'submodules/platform-3.0-Entities/userMeetingProviders_meeting';
import { AuthenticationMiddleware } from 'submodules/platform-3.0-Framework/authentication.middleware';
import { AuthorizationMiddleware } from 'submodules/platform-3.0-Framework/authorization.middleware';
// import { TenantFacade } from './facade/communityFacade';
// import { TenantRoutes } from './routes/communityRoutes';
import { BusinessEvent } from 'submodules/platform-3.0-Entities/businessEvent';
import { BusinessEventSubscriber } from 'submodules/platform-3.0-Entities/businessEventSubscriber';
import { Coupon } from 'submodules/platform-3.0-Entities/coupon';
import { Community } from 'submodules/platform-3.0-Entities/communities';
import { DdEntity } from 'submodules/platform-3.0-Entities/ddEntities';
import { EnrolledMeetings } from 'submodules/platform-3.0-Entities/enrolledMeetings';
import { Lesson } from 'submodules/platform-3.0-Entities/lesson';
import { LessonData } from 'submodules/platform-3.0-Entities/lessonData';
import { LessonDataReview } from 'submodules/platform-3.0-Entities/lessonDataReview';
import { LessonDataUser } from 'submodules/platform-3.0-Entities/lessonDataUser';
import { LiveContent } from 'submodules/platform-3.0-Entities/liveContent';
import { LiveContentUser } from 'submodules/platform-3.0-Entities/liveContentUser';
import { Payment } from 'submodules/platform-3.0-Entities/payment';
import { PaymentCoupon } from 'submodules/platform-3.0-Entities/paymentCoupon';
import { Section } from 'submodules/platform-3.0-Entities/section';
import { ServiceConsumer } from 'submodules/platform-3.0-Entities/serviceConsumer';
import {Notification} from 'submodules/platform-3.0-Entities/notifications'
import {Subscription} from 'submodules/platform-3.0-Entities/subscription'
import { SubscriptionOrder } from 'submodules/platform-3.0-Entities/subscriptionOrder';
import { ChannelGroup } from 'submodules/platform-3.0-Entities/channelGroup';
import { ChannelBillPlanRoutes } from './routes/channelBillPlanRoutes';
import { ChannelGroupRoutes } from './routes/channelGroupRoutes';
import { ChannelRoutes } from './routes/channelRoutes';
import { EnrolledMeetingRoutes } from './routes/enrolledMeetingRoutes';
import { LessonDataReviewRoutes } from './routes/lessonDataReviewRoutes';
import { LessonDataRoutes } from './routes/lessonDataRoutes';
import { LessonDataUserRoutes } from './routes/lessonDataUserRoutes';
import { LessonRoutes } from './routes/lessonRoutes';
import { LiveContentRoutes } from './routes/liveContentRoutes';
import { LiveContentUserRoutes } from './routes/liveContentUserRoutes';
import { SectionRoutes } from './routes/sectionRoutes';
import { ChannelBillPlanFacade } from './facade/channelBillPlanFacade';
import { ChannelGroupFacade } from './facade/channelGroupFacade';
import { ChannelFacade } from './facade/channelFacade';
import { EnrolledMeetingFacade } from './facade/enrolledMeetingFacade';
import { LessonDataReviewFacade } from './facade/lessonDataReviewFacade';
import { LessonDataFacade } from './facade/lessonDataFacade';
import { LessonDataUserFacade } from './facade/lessonDataUserFacade';
import { LessonFacade } from './facade/lessonFacade';
import { LiveContentUserFacade } from './facade/liveContentUserFacade';
import { LiveContentFacade } from './facade/liveContentFacade';
import { SectionFacade } from './facade/sectionFacade';
// import { ChannelBillPlan } from './smartup_entities/channelBillPlan';
// import { Channel } from './smartup_entities/channel';

@Module({
  imports: [HttpModule,
    TypeOrmModule.forFeature([ Community,Group,GroupUser,MeetingProvider,Plan,ChannelBillPlan,User,UserMeetingProvider,UserMeetingProviders_Meeting,Channel,ChannelGroup,BusinessEvent,BusinessEventSubscriber,Coupon,Community,DdEntity,EnrolledMeetings,Lesson,LessonData,LessonDataReview,LessonDataUser,LiveContent,LiveContentUser,Notification,Payment,PaymentCoupon,Section,ServiceConsumer,Subscription,SubscriptionOrder]),
  ],
  providers: [ ChannelBillPlanFacade,ChannelGroupFacade,ChannelFacade,EnrolledMeetingFacade,LessonDataReviewFacade,LessonDataFacade,LessonDataUserFacade,LessonFacade,LiveContentFacade,LiveContentUserFacade,SectionFacade],
  controllers: [ChannelBillPlanRoutes,ChannelGroupRoutes,ChannelRoutes,EnrolledMeetingRoutes,LessonDataReviewRoutes,LessonDataRoutes,LessonDataUserRoutes,LessonRoutes,LiveContentRoutes,LiveContentUserRoutes,SectionRoutes]
})
// export class  EntityModule{ }
export class EntityModule implements NestModule {
  constructor() {
    console.log("Inside Entity Module....");
  }

  configure(consumer: MiddlewareConsumer) {
    console.log("Inside Consumer baby......");
    consumer
      .apply(AuthenticationMiddleware,AuthorizationMiddleware)
      .forRoutes({path:"/*",method:RequestMethod.ALL});
  }
}