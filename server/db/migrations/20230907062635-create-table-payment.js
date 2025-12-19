module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('payment', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      transaction_id: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      payment_intent_id: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      receipt_url: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      amount: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'created',
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      payment_method_type: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      payment_method_id: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      update_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
    });
  },

  async down(queryInterface) {
    return queryInterface.dropTable('payment');
  },
};
