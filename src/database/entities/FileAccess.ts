import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { File } from './File';

@Entity('file_access')
export class FileAccess {
  @PrimaryGeneratedColumn()
  access_id: number;

  @ManyToOne(() => User, user => user.accessibleFiles)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => File, file => file.users)
  @JoinColumn({ name: 'file_id' })
  file: File;
}
