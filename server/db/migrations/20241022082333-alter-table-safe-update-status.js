'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn(
        'safe_note',
        'status',
        {
          type: Sequelize.ENUM(
            'draft',
            'sent',
            'cancelled',
            'signed',
            'declined',
          ),
          allowNull: false,
        },
        { transaction },
      );
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn(
        'safe_note',
        'status',
        {
          type: Sequelize.ENUM('draft', 'sent', 'cancelled', 'signed'),
          allowNull: false,
        },
        { transaction },
      );
    });
  },
};
