import * as supertest from 'supertest';

import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegistrationDto } from '@/modules/auth/dto/registration.dto';
import { AuthResponse } from '@/modules/auth/types';
import { CreateCompanyDto, UpdateCompanyDto } from '@/modules/company/types';
import { QueryOptions } from '@/modules/database/types';
import { CreateSafeDto } from '@/modules/safe-note/dto/create-safe.dto';
import { SafeNoteFilterDto } from '@/modules/safe-note/dto/safe-note-filter.dto';
import { InviteTeamMembersDto } from '@/modules/team-member/dto/invite-team-members.dto';
import { UpdateTeamMemberDto } from '@/modules/team-member/dto/update-team-member.dto';
import { CreateTermSheetDto } from '@/modules/term-sheet/dto/create-term-sheet.dto';
import { TermSheetFilterDto } from '@/modules/term-sheet/dto/term-sheet-filter.dto';
import { UrlUtils } from '@/shared/utils';

import { DataGenerator } from './data.generator';
import { toBearerToken } from './utils';

export class JestRequestHelper {
  private readonly http;
  private accessToken: string;

  constructor(http) {
    this.http = http;
  }

  public bearer(accessToken?: string) {
    return {
      Authorization: toBearerToken(accessToken || this.accessToken),
    };
  }

  public setToken(accessToken: string) {
    this.accessToken = accessToken;
    return this;
  }

  private request() {
    if (!this.http) {
      throw new Error('App is not provided. Helper cannot be used properly');
    }

    return supertest(this.http);
  }

  public auth() {
    return {
      login: async (body: LoginDto): Promise<AuthResponse> => {
        const response = await this.request()
          .post('/auth/login')
          .send(body)
          .expect(200);
        return response?.body;
      },

      signUp: async (body: RegistrationDto): Promise<AuthResponse> => {
        const response = await this.request()
          .post('/auth/registration')
          .send(body)
          .expect(201);
        return response?.body;
      },

      signUpRandomUser: async (): Promise<AuthResponse> => {
        const response = await this.request()
          .post('/auth/registration')
          .send(DataGenerator.userWithPassword())
          .expect(201);
        return response?.body;
      },
    };
  }

  public company(accessToken?: string) {
    if (accessToken) this.setToken(accessToken);

    return {
      getAll: async () => {
        const res = await this.request()
          .get('/company')
          .set(this.bearer())
          .expect(200);
        return res.body;
      },

      getById: async (id: string) => {
        const res = await this.request()
          .get(UrlUtils.withParams('/company/:id', { id }))
          .set(this.bearer())
          .expect(200);
        return res.body;
      },

      create: async (body: CreateCompanyDto) => {
        const res = await this.request()
          .post('/company')
          .set(this.bearer())
          .send(body)
          .expect(201);

        return res.body;
      },

      update: async (companyId: string, body: UpdateCompanyDto) => {
        const res = await this.request()
          .patch(UrlUtils.withParams('/company/:id', { id: companyId }))
          .set(this.bearer())
          .send(body)
          .expect(200);

        return res.body;
      },

      inviteTeamMembers: async (
        companyId: string,
        dto: InviteTeamMembersDto,
      ) => {
        const res = await this.request()
          .patch(
            UrlUtils.withParams('/company/:companyId/team-member', {
              companyId,
            }),
          )
          .set(this.bearer())
          .send(dto)
          .expect(201);
        return res.body;
      },

      updateTeamMember: async (
        companyId: string,
        userId: string,
        dto: UpdateTeamMemberDto,
      ) => {
        const res = await this.request()
          .patch(
            UrlUtils.withParams('/company/:companyId/team-member/:userId', {
              companyId,
              userId,
            }),
          )
          .set(this.bearer())
          .send(dto)
          .expect(200);
        return res.body;
      },

      mfnHolders: async (companyId: string) => {
        const res = await this.request()
          .get(
            UrlUtils.withParams('/company/:companyId/mfn-holders', {
              companyId,
            }),
          )
          .set(this.bearer())
          .expect(200);
        return res.body;
      },
    };
  }

  public safeNote(accessToken?: string) {
    if (accessToken) this.setToken(accessToken);

    return {
      getAll: async (filter: SafeNoteFilterDto) => {
        const res = await this.request()
          .get(UrlUtils.withQuery('/safe-note', filter as any))
          .set(this.bearer())
          .expect(200);

        return res.body;
      },

      getPendingSafe: async () => {
        const res = await this.request()
          .get('/safe-note/pending-safes')
          .set(this.bearer())
          .expect(200);

        return res.body;
      },

      getCompanySenders: async () => {
        const res = await this.request()
          .get('/safe-note/company-senders')
          .set(this.bearer())
          .expect(200);

        return res.body;
      },

      create: async (body: CreateSafeDto) => {
        const res = await this.request()
          .post('/safe-note')
          .set(this.bearer())
          .send(body)
          .expect(201);

        return res.body;
      },

      getFee: async (safeNoteId: string) => {
        const res = await this.request()
          .get(UrlUtils.withParams('/safe-note/:id/fee', { id: safeNoteId }))
          .set(this.bearer())
          .expect(200);

        return res.body;
      },

      assignCompany: async (safeNoteId: string, companyId: string) => {
        const res = await this.request()
          .post(
            UrlUtils.withParams(
              '/safe-note/:safeNoteId/assign-company/:companyId',
              {
                safeNoteId,
                companyId,
              },
            ),
          )
          .set(this.bearer())
          .expect(204);

        return res.body;
      },
    };
  }

  public termSheet(accessToken?: string) {
    if (accessToken) this.setToken(accessToken);

    return {
      getAll: async (query?: QueryOptions<TermSheetFilterDto>) => {
        const res = await this.request()
          .get(UrlUtils.withQueryOptions('/term-sheet', query))
          .set(this.bearer())
          .expect(200);

        return res.body;
      },

      getById: async (id: string) => {
        const res = await this.request()
          .get(UrlUtils.withParams('/term-sheet/:id', { id }))
          .set(this.bearer())
          .expect(200);

        return res.body;
      },

      create: async (dto: CreateTermSheetDto) => {
        const res = await this.request()
          .post('/term-sheet')
          .set(this.bearer())
          .send(dto)
          .expect(201);

        return res.body;
      },
    };
  }
}
