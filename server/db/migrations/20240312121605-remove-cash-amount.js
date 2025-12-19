module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('safe_note', 'cash_amount');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('safe_note', 'cash_amount', {
      type: Sequelize.DOUBLE,
      allowNull: true,
      defaultValue: null,
    });
  },
};
