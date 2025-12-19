import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as PizZip from 'pizzip';
import { Transaction } from 'sequelize';

import { rootDir } from '@/directories';
import { CompanyType } from '@/modules/company/enums';
import { CompanyService } from '@/modules/company/service/company.service';
import { BaseServiceImpl } from '@/modules/database/base.service';
import { TxService } from '@/modules/database/tx.service';
import {
  ICreateOptions,
  IFindOptions,
  ServiceQueryOptions,
} from '@/modules/database/types';
import { StorageService } from '@/modules/storage/service/storage.service';
import { CreateTermSheetDto } from '@/modules/term-sheet/dto/create-term-sheet.dto';
import { DownloadTermSheetDto } from '@/modules/term-sheet/dto/download-term-sheet.dto';
import { SignTermSheetDto } from '@/modules/term-sheet/dto/sign-term-sheet.dto';
import { TermSheetUserEntity } from '@/modules/term-sheet/entity/term-sheet-user.entity';
import { TermSheetEntity } from '@/modules/term-sheet/entity/term-sheet.entity';
import { TermSheetRepository } from '@/modules/term-sheet/repository/term-sheet.repository';
import { camelCaseToDashCase } from '@/shared/utils';

@Injectable()
export class TermSheetService extends BaseServiceImpl<TermSheetEntity> {
  constructor(
    private readonly companyService: CompanyService,
    private readonly txService: TxService,
    private readonly termSheetRepository: TermSheetRepository,
    private readonly storageService: StorageService,
  ) {
    super(termSheetRepository);
  }

  public async getAllForUser(userId: string, options?: IFindOptions) {
    // to not show all the safe notes if filter is not set
    if (Object.keys(options?.filters).length === 0) return [];

    return this.termSheetRepository.getAllForUser(userId, options);
  }

  public async getByForUser(
    id: string,
    userId: string,
    options?: IFindOptions,
  ) {
    return this.termSheetRepository.getByIdForUser(id, userId, options);
  }

  public async getPendingTermSheets(userId: string) {
    return this.termSheetRepository.getPendingTermSheets(userId);
  }

  public async getCompanyIdsFromReceivedTermSheets(
    userId: string,
    options?: ServiceQueryOptions,
  ) {
    return (
      await this.termSheetRepository.getAll({
        include: [
          {
            model: TermSheetUserEntity,
            as: 'termSheetUser',
            where: {
              userId,
            },
          },
        ],
        attributes: ['senderCompanyId'],
        ...options,
      })
    ).map((entity: TermSheetEntity) => entity.senderCompanyId);
  }

  public async create(
    dto: Omit<CreateTermSheetDto, 'recipients'>,
    options?: ICreateOptions,
  ) {
    const company = await this.companyService.getById(dto.senderCompanyId);

    if (company.type !== CompanyType.ENTREPRENEUR) {
      throw new BadRequestException('Only Entrepreneurs can create term sheet');
    }
    const { signature, ...data } = dto;

    if (dto.mfn) {
      dto.discountRate = null;
      dto.valuationCap = null;
    }

    return this.txService.transaction(async (transaction) => {
      const termSheet = await this.termSheetRepository.create(data, {
        ...options,
        transaction,
      });

      if (signature && termSheet?.id) {
        await this.addSignature(
          termSheet.id,
          {
            signature,
            name: dto.signName,
          },
          transaction,
        );
      }

      return termSheet;
    }, options?.transaction);
  }

  async addSignature(
    termSheetId: string,
    dto: SignTermSheetDto,
    transaction?: Transaction,
  ) {
    const termSheet = await this.termSheetRepository.getById(termSheetId, {
      transaction,
    });

    if (!!termSheet.signature) {
      throw new BadRequestException('Term sheet already signed!');
    }

    const signature = await this.storageService.saveTermSheetFile({
      file: dto.signature,
      fileName: camelCaseToDashCase('signature'),
      termSheetId,
    });

    return this.termSheetRepository.updateById(
      termSheetId,
      {
        signature: signature.url,
        signName: dto.name,
        signDate: new Date(),
      },
      { transaction },
    );
  }

  public getTermSheetDocumentBasedOnData(dto: DownloadTermSheetDto) {
    if (dto.mfn) {
      return fs.readFileSync(
        path.resolve(rootDir, 'static/docs/mfn-term-sheet.docx'),
        'binary',
      );
    }

    if (dto.discountRate && dto.valuationCap) {
      return fs.readFileSync(
        path.resolve(
          rootDir,
          'static/docs/discount-and-valuation-term-sheet.docx',
        ),
        'binary',
      );
    }

    if (dto.discountRate) {
      return fs.readFileSync(
        path.resolve(rootDir, 'static/docs/discount-only-term-sheet.docx'),
        'binary',
      );
    }

    if (dto.valuationCap) {
      return fs.readFileSync(
        path.resolve(rootDir, 'static/docs/valuation-only-term-sheet.docx'),
        'binary',
      );
    }

    return null;
  }

  public async downloadTermSheetDocument(dto: DownloadTermSheetDto) {
    const file = this.getTermSheetDocumentBasedOnData(dto);

    if (!file) {
      throw new BadRequestException(
        'Cannot find existing term sheet document from current data',
      );
    }

    const Docxtemplater: any = await import('docxtemplater');
    const zipContent = new PizZip(file);

    const doc = new Docxtemplater(zipContent, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.render({
      ...dto,
      valuationCap: dto.valuationCap,
      hasRoundAmount: Boolean(dto?.roundAmount && dto?.roundAmount !== 0),
    });

    return doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });
  }
}
