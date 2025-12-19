module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'safe_note',
        'data',
        {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: null,
        },
        { transaction },
      );
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('safe_note', 'data', {
        transaction,
      });
    });
  },
};
