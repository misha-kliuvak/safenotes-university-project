module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('entrepreneur_company', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      parent_id: {
        type: Sequelize.UUID,
        references: {
          model: 'company',
          key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      state_of_incorporation: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      ein_number: {
        type: Sequelize.BIGINT,
        allowNull: true,
        defaultValue: null,
      },
    });
  },

  async down(queryInterface) {
    return queryInterface.dropTable('entrepreneur_company');
  },
};
