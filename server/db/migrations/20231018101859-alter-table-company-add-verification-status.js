module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('company', 'verification_status', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('company', 'verification_status');
  },
};
