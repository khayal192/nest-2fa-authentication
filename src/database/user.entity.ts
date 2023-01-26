import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  fullname: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ select: false, nullable: true })
  authConfirmToken: string;

  @Column({ default: false, nullable: true })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
