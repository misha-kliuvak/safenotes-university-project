module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'subscription',
        'stripe_latest_invoice_id',
        {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: null,
        },
        { transaction },
      );
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'subscription',
        'stripe_latest_invoice_id',
        {
          transaction,
        },
      );
    });
  },
};
