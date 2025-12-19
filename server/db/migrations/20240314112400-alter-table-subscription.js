module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn(
        'subscription',
        'plan',
        {
          type: Sequelize.ENUM('extend'),
          allowNull: false,
          defaultValue: 'extend',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'subscription',
        'stripe_subscription_id',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'subscription',
        'status',
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
      await queryInterface.removeColumn(
        'subscription',
        'stripe_subscription_id',
        { transaction },
      );
      await queryInterface.removeColumn('subscription', 'status', {
        transaction,
      });

      await queryInterface.changeColumn(
        'subscription',
        'plan',
        {
          type: Sequelize.ENUM('basic', 'extend'),
          allowNull: false,
          defaultValue: 'basic',
        },
        { transaction },
      );
    });
  },
};
