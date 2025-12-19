module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('user', 'otp_secret', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn('user', 'otp_auth_url', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn('user', 'otp_enabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('user', 'otp_verified', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('user', 'otp_secret');
    await queryInterface.removeColumn('user', 'otp_auth_url');
    await queryInterface.removeColumn('user', 'otp_enabled');
    await queryInterface.removeColumn('user', 'otp_verified');
  },
};
