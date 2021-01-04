import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityModule } from './app/entity.module';
// import { Product } from './product/product.entity';
import { GenericSubscriber } from 'submodules/platform-3.0-Framework/GenericSubscriber';
import { DATABASE_HOST, DATABASE_NAME, DATABASE_PASSWORD, DATABASE_PORT, DATABASE_TYPE, DATABASE_USERNAME } from 'config';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: DATABASE_TYPE,
      host: DATABASE_HOST,
      username: DATABASE_USERNAME,
      password: DATABASE_PASSWORD,
      port:DATABASE_PORT,
      database: DATABASE_NAME,
      entities: [ ],
      subscribers: [ GenericSubscriber ],
      synchronize: true,
      autoLoadEntities: true,
      logger: 'advanced-console',
      logging: 'all'
    }),
    EntityModule,
  ],
  controllers: [ AppController ],
  providers: [AppService],

})
export class AppModule {
  constructor() {
    console.log("Inside the App")
  }
 }
