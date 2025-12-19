module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('subscription', 'plan', {
        transaction,
      });
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'subscription',
        'plan',
        {
          type: Sequelize.ENUM('extend'),
          allowNull: false,
          defaultValue: 'extend',
        },
        { transaction },
      );
    });
  },
};
