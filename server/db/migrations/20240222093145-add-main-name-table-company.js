module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('company', 'main_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('company', 'main_name');
  },
};
