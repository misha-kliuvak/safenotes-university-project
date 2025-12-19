module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('safe_note', 'term_sheet_id', {
      type: Sequelize.UUID,
      references: {
        model: 'term_sheet',
        key: 'id',
      },
      allowNull: true,
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('safe_note', 'term_sheet_id');
  },
};
