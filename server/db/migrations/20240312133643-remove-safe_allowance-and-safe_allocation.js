module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('safe_note', 'safe_allowance');
    await queryInterface.removeColumn('safe_note', 'safe_allocation');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('safe_note', 'safe_allowance', {
      type: Sequelize.DOUBLE,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn('safe_note', 'safe_allocation', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: null,
    });
  },
};
