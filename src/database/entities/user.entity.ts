import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Post } from './post.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  // id: number;
  id: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  // ---------------

  @OneToMany(() => Post, (entity) => entity.user)
  posts?: Post[];
}
