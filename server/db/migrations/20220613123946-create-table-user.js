module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('user', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      full_name: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      oauth_providers: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null,
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      current_profile_id: {
        type: Sequelize.UUID,
        allowNull: true,
        defaultValue: null,
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
    return queryInterface.dropTable('user');
  },
};
