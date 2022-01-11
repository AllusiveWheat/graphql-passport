import { Field, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field(() => String)
  id: string;

  @Column({})
  @Field(() => String)
  firstName: string;

  @Column({ nullable: true })
  @Field(() => String)
  lastName: string;

  @Column({ unique: true, nullable: true })
  @Field(() => String)
  email: string;

  @Column({ nullable: true, unique: true }) // If Logged in with Spotify, this will be null
  @Field(() => String)
  password: string;

  @Column({ nullable: true, unique: true })
  @Field(() => String)
  oauthId: string;

  @Column({ nullable: true })
  @Field(() => String)
  accessToken: string;

  @Column({ nullable: true })
  @Field(() => String)
  refreshToken: string;
}
