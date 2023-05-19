import { BaseInterfaceRepository } from '@app/shared';

import { UserEntity } from '../entities/user.entity';

//eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserRepositoryInterface
  extends BaseInterfaceRepository<UserEntity> {}
