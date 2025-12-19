module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'user',
        'plaid_access_token',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'user',
        'plaid_item_id',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'payment',
        'provider',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction },
      );
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('user', 'plaid_access_token', {
        transaction,
      });
      await queryInterface.removeColumn('user', 'plaid_item_id', {
        transaction,
      });
      await queryInterface.removeColumn('payment', 'provider', {
        transaction,
      });
    });
  },
};
