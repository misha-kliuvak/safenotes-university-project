module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('term_sheet', 'safe_allowance');
    await queryInterface.removeColumn('term_sheet', 'safe_allocation');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('term_sheet', 'safe_allowance', {
      type: Sequelize.DOUBLE,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn('term_sheet', 'safe_allocation', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: null,
    });
  },
};
