module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('token_blacklist', {
      token: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    return queryInterface.dropTable('token_blacklist');
  },
};
