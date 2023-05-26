import { ManyToOne, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { UserEntity } from '@app/shared';

@Entity('friend-request')
export class FriendRequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.friendRequests)
  sender: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.friendRequests)
  receiver: UserEntity;
}
