import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';

import { TxService } from '../tx.service';

jest.mock('sequelize-typescript', () => require('@mocks/sequelize-typescript'));

describe('TxService', () => {
  let service: TxService;
  let sequelize: Sequelize;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SequelizeModule.forRoot({ dialect: 'postgres' })],
      providers: [TxService],
    }).compile();

    service = module.get<TxService>(TxService);
    sequelize = module.get<Sequelize>(Sequelize);
  });

  describe('transaction', () => {
    it('should execute the callback function in a transaction', async () => {
      const callback = jest.fn().mockResolvedValue('result');
      const transaction = await sequelize.transaction();

      const result = await service.transaction(callback, transaction);

      expect(callback).toHaveBeenCalledWith(transaction);
      expect(result).toBe('result');
    });

    it('should rollback the transaction if the callback function throws an error', async () => {
      const callback = jest.fn().mockRejectedValue(new Error('error'));
      const transaction = await sequelize.transaction();

      await expect(service.transaction(callback, transaction)).rejects.toThrow(
        'error',
      );

      const rollbackSpy = jest.spyOn(transaction, 'rollback');

      expect(callback).toHaveBeenCalledWith(transaction);
      expect(rollbackSpy).not.toBeCalled();
    });

    it('should commit the transaction if the callback function resolves', async () => {
      const callback = jest.fn().mockResolvedValue('result');
      const transaction = await sequelize.transaction();

      const result = await service.transaction(callback, transaction);

      const commitSpy = jest.spyOn(transaction, 'commit');

      expect(callback).toHaveBeenCalledWith(transaction);
      expect(result).toBe('result');
      expect(commitSpy).not.toBeCalled();
    });

    it('should create a new transaction if one is not provided', async () => {
      const callback = jest.fn().mockResolvedValue('result');

      const result = await service.transaction(callback);

      expect(callback).toHaveBeenCalled();
      expect(result).toBe('result');
    });
  });
});
