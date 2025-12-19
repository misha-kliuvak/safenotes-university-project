module.exports = {
  async up(queryInterface) {
    return queryInterface.renameColumn(
      'safe_note',
      'company_id',
      'sender_company_id',
    );
  },

  async down(queryInterface) {
    return queryInterface.renameColumn(
      'safe_note',
      'sender_company_id',
      'company_id',
    );
  },
};
