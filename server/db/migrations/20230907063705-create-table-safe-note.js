module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('safe_note', {
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
      recipient_id: {
        type: Sequelize.UUID,
        references: {
          model: 'user',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      safe_for: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      safe_amount: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: null,
      },
      cash_amount: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: null,
      },
      discount_rate: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: null,
      },
      safe_allowance: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: null,
      },
      safe_allocation: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: null,
      },
      mfn: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      sender_signature: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: false,
      },
      sender_sign_date: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      sender_sign_name: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      recipient_sign_name: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      recipient_signature: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: false,
      },
      recipient_sign_date: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      payment_id: {
        type: Sequelize.UUID,
        references: {
          model: 'payment',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'draft',
        allowNull: false,
      },
      paid: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
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
    });
  },

  async down(queryInterface) {
    return queryInterface.dropTable('safe_note');
  },
};
