module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('term_sheet', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      sender_company_id: {
        type: Sequelize.UUID,
        references: {
          model: 'company',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      round_amount: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: null,
      },
      discount_rate: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: null,
      },
      safe_allowance: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: null,
      },
      safe_allocation: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: null,
      },
      mfn: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
    });
  },

  async down(queryInterface) {
    return queryInterface.dropTable('term_sheet');
  },
};
