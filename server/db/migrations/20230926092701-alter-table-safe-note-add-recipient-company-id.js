module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('safe_note', 'recipient_company_id', {
      type: Sequelize.UUID,
      references: {
        model: 'company',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    return queryInterface.removeColumn('safe_note', 'recipient_company_id');
  },
};
