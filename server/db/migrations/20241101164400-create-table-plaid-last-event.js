module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('plaid_settings', {
      key: {
        type: Sequelize.ENUM('lastEventId'),
        allowNull: false,
        unique: true,
      },
      value: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    return queryInterface.dropTable('plaid_settings');
  },
};
