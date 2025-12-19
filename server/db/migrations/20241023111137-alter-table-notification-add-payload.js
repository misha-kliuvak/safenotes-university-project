'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'notification',
        'payload',
        {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: null,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'notification',
        'type',
        {
          type: Sequelize.ENUM(
            'incoming_safe_note',
            'team_member_request',
            'signed_safe_note',
          ),
          allowNull: false,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'notification',
        'company_id',
        {
          type: Sequelize.UUID,
          allowNull: true,
          defaultValue: null,
          references: {
            model: 'company',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        { transaction },
      );

      await queryInterface.removeColumn('notification', 'title', {
        transaction,
      });
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('notification', 'payload', {
        transaction,
      });
      await queryInterface.removeColumn('notification', 'type', {
        transaction,
      });
      await queryInterface.removeColumn('notification', 'company_id', {
        transaction,
      });
      await queryInterface.addColumn(
        'notification',
        'title',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        {
          transaction,
        },
      );
    });
  },
};
