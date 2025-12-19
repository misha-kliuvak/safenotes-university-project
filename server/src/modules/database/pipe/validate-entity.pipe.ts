import { GetEntity } from '@/modules/database/pipe/get-entity.pipe';
import { GetEntityPipeOptions } from '@/modules/database/types';

export class ValidateEntity extends GetEntity {
  constructor(
    Repository: any,
    options?: Omit<GetEntityPipeOptions, 'validateOnly'>,
  ) {
    super(Repository, {
      ...options,
      validateOnly: true,
    });
  }
}
