'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('notification', 'type', {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.sequelize.query('drop type enum_notification_type;');

    await queryInterface.changeColumn('notification', 'type', {
      type: Sequelize.ENUM(
        'incoming_safe_note',
        'team_member_request',
        'signed_safe_note',
        'payed_safe_note',
      ),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('notification', 'type', {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.sequelize.query('drop type enum_notification_type;');

    await queryInterface.changeColumn('notification', 'type', {
      type: Sequelize.ENUM(
        'incoming_safe_note',
        'team_member_request',
        'signed_safe_note',
      ),
      allowNull: false,
    });
  },
};
