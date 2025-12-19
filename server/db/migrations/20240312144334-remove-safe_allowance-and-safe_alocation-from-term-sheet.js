module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('term_sheet', 'valuation_cap', {
      type: Sequelize.DOUBLE,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('term_sheet', 'valuation_cap');
  },
};
