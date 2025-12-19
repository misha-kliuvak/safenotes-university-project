import { Inject, Injectable } from '@nestjs/common';

import { CompanyUserService } from '@/modules/company/service/company-user.service';
import { SafeNoteEntity } from '@/modules/safe-note/entity/safe-note.entity';
import { ViewSafeAs } from '@/modules/safe-note/enums';
import { SafeNoteService } from '@/modules/safe-note/service/safe-note.service';
import { SafeNotePermissions, SafeNoteTerms } from '@/modules/safe-note/types';
import { UserService } from '@/modules/user/user.service';
import { RequestWithUser } from '@/shared/types';

@Injectable()
export class SafeNotePresenter {
  constructor(
    @Inject('REQUEST') private readonly request: RequestWithUser,
    private readonly userService: UserService,
    private readonly companyUserService: CompanyUserService,
    private readonly safeNoteService: SafeNoteService,
  ) {}

  private async getNewSafeTerms(
    safeNote: SafeNoteEntity,
  ): Promise<SafeNoteTerms> {
    // if (safeNote.mfn) {
    //   return this.safeNoteService.getMaxTerms(safeNote.senderCompanyId);
    // }

    return {
      discountRate: safeNote.discountRate,
      valuationCap: safeNote.valuationCap,
    };
  }

  private getViewAs(safeNote: SafeNoteEntity) {
    const currentUserId = this.request?.user?.id;

    let viewAs = ViewSafeAs.TEAM_MEMBER;

    if (currentUserId === safeNote.senderCompany?.owner?.id) {
      viewAs = ViewSafeAs.SENDER;
    }

    if (currentUserId === safeNote.recipientId) {
      viewAs = ViewSafeAs.RECIPIENT;
    }

    return viewAs;
  }

  private async getSafeNotePermission(
    viewAs: ViewSafeAs,
    safeNote: SafeNoteEntity,
  ): Promise<SafeNotePermissions> {
    const currentUserId = this.request?.user?.id;

    let canSign = false;

    switch (viewAs) {
      case ViewSafeAs.SENDER:
        canSign =
          !safeNote.senderSignature &&
          currentUserId === safeNote.senderCompany?.owner.id;
        break;
      case ViewSafeAs.RECIPIENT:
        canSign =
          safeNote.recipientCompanyId &&
          !safeNote.recipientSignature &&
          currentUserId === safeNote.recipientId;
        break;
    }

    return {
      canSign,
    };
  }

  public async present(entity: SafeNoteEntity) {
    if (!entity || !(entity instanceof SafeNoteEntity)) return entity;

    const safeNote = entity.toJSON();
    const viewAs = this.getViewAs(safeNote);

    const newSafeTerms = await this.getNewSafeTerms(safeNote);
    const permissions = await this.getSafeNotePermission(viewAs, safeNote);

    return {
      viewAs,
      ...safeNote,
      ...newSafeTerms,
      ...permissions,
    };
  }

  public async collection(safeNotes: SafeNoteEntity[]) {
    const result: SafeNoteEntity[] = [];

    for (const safeNote of safeNotes) {
      result.push(await this.present(safeNote));
    }

    return result;
  }
}
