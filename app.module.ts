// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { EntityModule } from './app/entity.module';
// import { Product } from './product/product.entity';
import { GenericSubscriber } from 'submodules/platform-3.0-Framework/GenericSubscriber';
import { DATABASE_HOST, DATABASE_NAME, DATABASE_PASSWORD, DATABASE_PORT, DATABASE_TYPE, DATABASE_USERNAME } from 'config';


// @Module({
//   imports: [
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: 'smartupdev.cjrt7sgid3vo.us-east-2.rds.amazonaws.com',
    //   username: 'postgres',
    //   password: '123Lid1234',
    //   port:5432,
    //   database: 'smartupdev',
    //   subscribers: [ GenericSubscriber ],
    //   synchronize: false,
    //   autoLoadEntities: true,
    //   logger: 'advanced-console',
    //   logging: 'all'
    // }),
//     EntityModule,
//   ],
//   controllers: [ AppController ],
//   providers: [AppService],

// })
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityModule } from 'app/entity.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: 'smartupdev.cjrt7sgid3vo.us-east-2.rds.amazonaws.com',
        username: 'postgres',
        password: '123Lid1234',
        port:5432,
        database: 'smartupdev',
        subscribers: [ GenericSubscriber ],
        synchronize: true,
        autoLoadEntities: true,
        logger: 'advanced-console',
        logging: 'all'
      }),
    }),
    EntityModule
  ],
})
export class AppModule {}
