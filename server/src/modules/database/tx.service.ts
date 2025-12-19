import { Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class TxService {
  constructor(public readonly sequelize: Sequelize) {}

  private async getTransaction() {
    return this.sequelize.transaction();
  }

  public async transaction(callback: any, transaction?: Transaction) {
    const isLocalTransaction = !transaction;

    const t = isLocalTransaction ? await this.getTransaction() : transaction;

    try {
      const res = await callback(t);

      if (isLocalTransaction) {
        await t.commit();
      }

      return res;
    } catch (err) {
      if (isLocalTransaction) {
        await t.rollback();
      }
      throw err;
    }
  }
}
