module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('company', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addIndex('company', ['deleted_at'], {
      name: 'company_deleted_at',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('company', 'company_deleted_at');
    await queryInterface.removeColumn('company', 'deleted_at');
  },
};
