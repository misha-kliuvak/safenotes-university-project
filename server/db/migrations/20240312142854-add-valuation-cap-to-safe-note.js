module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('safe_note', 'valuation_cap', {
      type: Sequelize.DOUBLE,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('safe_note', 'valuation_cap');
  },
};
