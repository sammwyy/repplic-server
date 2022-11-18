import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@ObjectType()
@Schema({ timestamps: true })
export class Profile {
  @Field(() => ID)
  _id: string;

  @Prop({ required: true })
  accountId: string;

  @Field()
  @Prop({ required: true, lowercase: true, unique: true })
  username: string;

  @Field()
  @Prop({ required: true })
  displayName: string;

  @Field()
  @Prop({ required: true })
  bio: string;

  @Field(() => Number)
  createdAt: Date;
}

export type ProfileDocument = Profile & Document;
export const ProfileSchema = SchemaFactory.createForClass(Profile);
