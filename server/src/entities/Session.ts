import { ISession } from "connect-typeorm";
import { Column, EntityRepository, Index, PrimaryColumn } from "typeorm";

@EntityRepository()
export class Session implements ISession {
  @PrimaryColumn("uuid")
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  expires: Date;

  @Column()
  data: string;

  @Column()
  expiredAt: number;

  @Column()
  json: string;
}
