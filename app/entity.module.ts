import { HttpModule, HttpService, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
// import { ProductService } from './product.service';

import { GroupUserFacade } from './facade/groupUserFacade';
import { UserFacade } from './facade/userFacade';
import { GroupUserRoutes } from './routes/groupUserRoutes';
import { GroupFacade } from './facade/groupFacade';
import { UserRoutes } from './routes/userRoutes';
import { GroupRoutes } from './routes/groupRoutes';
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
import { SubscriptionOrderDto } from 'submodules/platform-3.0-Dtos/subscriptionOrderDto';
import { SubscriptionOrder } from 'submodules/platform-3.0-Entities/subscriptionOrder';
import { SNS_SQS } from 'submodules/platform-3.0-Framework/aws/models/SNS_SQS';
import { CommunityFacade } from './facade/communityFacade';
import { CommunityRoutes } from './routes/communityRoutes';
import { ChannelGroup } from 'submodules/platform-3.0-Entities/channelGroup';
// import { ChannelBillPlan } from './smartup_entities/channelBillPlan';
// import { Channel } from './smartup_entities/channel';

@Module({
  imports: [HttpModule,
    TypeOrmModule.forFeature([ Community,Group,GroupUser,MeetingProvider,Plan,ChannelBillPlan,User,UserMeetingProvider,UserMeetingProviders_Meeting,Channel,ChannelGroup,BusinessEvent,BusinessEventSubscriber,Coupon,Community,DdEntity,EnrolledMeetings,Lesson,LessonData,LessonDataReview,LessonDataUser,LiveContent,LiveContentUser,Notification,Payment,PaymentCoupon,Section,ServiceConsumer,Subscription,SubscriptionOrder]),
  ],
  providers: [ CommunityFacade,GroupUserFacade,GroupFacade,UserFacade],
  controllers: [CommunityRoutes, GroupUserRoutes, GroupRoutes, UserRoutes]
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