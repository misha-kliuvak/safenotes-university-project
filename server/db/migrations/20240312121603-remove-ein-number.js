module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('entrepreneur_company', 'ein_number');
    await queryInterface.removeColumn('angel_company', 'ein_number');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('entrepreneur_company', 'ein_number', {
      type: Sequelize.BIGINT,
      field: 'ein_number',
      defaultValue: null,
    });

    await queryInterface.addColumn('angel_company', 'ein_number', {
      type: Sequelize.BIGINT,
      field: 'ein_number',
      defaultValue: null,
    });
  },
};
