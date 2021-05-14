// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { EntityModule } from './app/entity.module';
// import { Product } from './product/product.entity';

import { DATABASE_HOST, DATABASE_NAME, DATABASE_PASSWORD, DATABASE_PORT, DATABASE_TYPE, DATABASE_USERNAME, MAIL_HOST, MAIL_PORT, MAIL_TLS } from 'config';


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
import { AppController } from 'app.controller';
import { AppService } from 'app.service';
import { GenericSubscriber } from 'submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/GenericSubscriber';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { join } from 'path';
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService): MailerModule => ({
        transport: {
          host: configService.get(MAIL_HOST),
          port: Number(configService.get(MAIL_PORT)),
          ignoreTLS: Boolean(configService.get(MAIL_TLS)),
        },
        defaults: {
          from: '"NoReply Nevook " <noreply@nevook.com>',
        },
        template: {
          dir: join(__dirname, '../platform-3.0-Channels/templates'),
          adapter: new EjsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: DATABASE_TYPE,
        host: DATABASE_HOST,
        username: DATABASE_USERNAME,
        password: DATABASE_PASSWORD,
        port:DATABASE_PORT,
        database: DATABASE_NAME,
        subscribers: [ GenericSubscriber ],
        cli: {
          migrationsDir: 'app/migration'
        },
        synchronize: false,
        autoLoadEntities: true,
        logger: 'advanced-console',
        logging: 'all',
        keepConnectionAlive:true
      }),
    }),
    
    EntityModule
  ],
  controllers: [AppController],
  providers : [AppService]
  
})
export class AppModule {}
          