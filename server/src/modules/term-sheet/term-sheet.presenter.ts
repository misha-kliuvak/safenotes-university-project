import { Inject, Injectable } from '@nestjs/common';

import { SafeNoteService } from '@/modules/safe-note/service/safe-note.service';
import { TermSheetEntity } from '@/modules/term-sheet/entity/term-sheet.entity';
import { SafeProgress, TermSheetStatus } from '@/modules/term-sheet/enums';
import { TermSheetService } from '@/modules/term-sheet/term-sheet.service';
import { RequestWithUser } from '@/shared/types';

@Injectable()
export class TermSheetPresenter {
  constructor(
    @Inject('REQUEST') private readonly request: RequestWithUser,
    private readonly termSheetService: TermSheetService,
    private readonly safeNoteService: SafeNoteService,
  ) {}

  public async present(entity: TermSheetEntity) {
    if (!entity || !(entity instanceof TermSheetEntity)) return entity;

    const currentUser = this.request.user;
    const notSender = entity.sender?.id !== currentUser.id;

    const rejectedWithoutCompany =
      entity.termSheetUser?.status === TermSheetStatus.REJECTED &&
      !entity.termSheetUser.userCompanyId;

    if (notSender && rejectedWithoutCompany) {
      return;
    }

    for (const item of entity.recipients) {
      const safeNote = await this.safeNoteService.getOne({
        where: {
          termSheetId: entity.id,
          recipientId: item.userId,
        },
      });

      if (safeNote?.paid) {
        item.safeProgress = SafeProgress.PAID;
      } else if (!!safeNote) {
        item.safeProgress = SafeProgress.CREATED;
      }
    }

    return entity;
  }

  public async collection(entities: TermSheetEntity[]) {
    const result: TermSheetEntity[] = [];

    for (const entity of entities) {
      const _result = await this.present(entity);

      if (_result) result.push(_result);
    }

    return result;
  }
}
