import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './modules/profile/profiles.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    /**
     * Using the GraphQL module it will load all the schemas automatically
     * and generate the .gql file
     * Also the playground mode and debug will only be available if the application
     *  is running under a development environment.
     */
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'graphql', 'schema.gql'),
      driver: ApolloDriver,
      path: '/',
    }),

    /**
     * Using the database module it will connect to the
     * mongodb server specified in the environment variable "MONGODB_URI"
     */
    MongooseModule.forRoot(process.env['MONGODB_URI']),

    /**
     * Connect to the SMTP server to send emails to users.
     */
    MailerModule.forRoot({
      transport: process.env['SMTP_URI'],
      defaults: {
        from: '"Repplic" <no-reply@repplic.com>',
      },
      template: {
        dir: join(process.cwd(), 'mail'),
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),

    /**
     * Load all the remaining modules that are responsible for managing different schemes and services.
     */
    AuthModule,
    ProfilesModule,
    SessionsModule,
    UsersModule,
  ],
})
export class AppModule {}
