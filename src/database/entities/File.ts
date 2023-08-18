import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { FileAccess } from './FileAccess';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn()
  file_id: number;

  @Column()
  filename: string;

  @Column()
  file_path: string;

  @Column()
  file_extension: string;

  @Column()
  ispublic: boolean;

  @OneToMany(() => FileAccess, fileAccess => fileAccess.file)
  fileAccess: FileAccess[];

  @ManyToOne(() => User, user => user.accessibleFiles)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToMany(() => User, user => user.accessibleFiles, { cascade: true })
  @JoinTable({
    name: 'file_access',
    joinColumn: {
      name: 'file_id',
      referencedColumnName: 'file_id',
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'user_id',
    },
  })
  users: User[];
}
