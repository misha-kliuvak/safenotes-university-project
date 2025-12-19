module.exports = {
  async up(queryInterface, Sequelize) {
    //term_sheet_user table
    await queryInterface.addColumn('term_sheet_user', 'signature', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: false,
    });

    await queryInterface.addColumn('term_sheet_user', 'sign_date', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn('term_sheet_user', 'sign_name', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });

    //term_sheet table
    await queryInterface.addColumn('term_sheet', 'signature', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: false,
    });

    await queryInterface.addColumn('term_sheet', 'sign_date', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn('term_sheet', 'sign_name', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('term_sheet_user', 'signature');
    await queryInterface.removeColumn('term_sheet_user', 'sign_date');
    await queryInterface.removeColumn('term_sheet_user', 'sign_name');

    await queryInterface.removeColumn('term_sheet', 'signature');
    await queryInterface.removeColumn('term_sheet', 'sign_date');
    await queryInterface.removeColumn('term_sheet', 'sign_name');
  },
};
