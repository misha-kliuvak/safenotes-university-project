module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('company', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      goal: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: null,
      },
      address_id: {
        type: Sequelize.UUID,
        references: {
          model: 'address',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    return queryInterface.dropTable('company');
  },
};
