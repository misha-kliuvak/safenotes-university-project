module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn(
        'company',
        'verification_status',
        {
          type: Sequelize.ENUM(
            'notVerified',
            'pending',
            'verified',
            'expired',
            'declined',
          ),
          allowNull: false,
        },
        { transaction },
      );
      await queryInterface.changeColumn(
        'company',
        'verification_status',
        {
          type: Sequelize.ENUM(
            'notVerified',
            'pending',
            'verified',
            'expired',
            'declined',
          ),
          allowNull: false,
          defaultValue: 'notVerified',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'company',
        'verification_end_at',
        {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
        },
        { transaction },
      );
      await queryInterface.createTable(
        'file',
        {
          id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
          },
          model_classname: {
            type: Sequelize.STRING,
            allowNull: true,
          },
          model_id: {
            type: Sequelize.UUID,
            allowNull: true,
          },
          collection_name: {
            type: Sequelize.STRING,
            allowNull: true,
          },
          absolute_path: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          relative_path: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          original_name: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          file_name: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          encoding: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          url: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null,
          },
          mimetype: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          size: {
            type: Sequelize.DOUBLE,
            allowNull: false,
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: true,
          },
        },
        { transaction },
      );
      await queryInterface.createTable(
        'company_payment',
        {
          id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
          },
          company_id: {
            type: Sequelize.UUID,
            references: {
              model: 'company',
              key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          payment_id: {
            type: Sequelize.UUID,
            references: {
              model: 'payment',
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
            defaultValue: null,
          },
        },
        { transaction },
      );
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('company', 'verification_end_at', {
        transaction,
      });
      await queryInterface.changeColumn(
        'company',
        'verification_status',
        {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: null,
        },
        { transaction },
      );
      await queryInterface.dropTable('company_payment', { transaction });
      await queryInterface.dropTable('file', { transaction });
    });
  },
};
