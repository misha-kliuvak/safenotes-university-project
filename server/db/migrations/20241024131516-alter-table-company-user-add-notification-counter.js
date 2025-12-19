'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('company_user', 'notification_count', {
      type: Sequelize.DOUBLE,
      defaultValue: 0,
      allowNull: false,
    });

    // Create the increment function
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION increment_notification_count() 
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.read = FALSE THEN
          UPDATE company_user
          SET notification_count = notification_count + 1
          WHERE company_id = NEW.company_id AND user_id = NEW.user_id;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create the decrement function
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION decrement_notification_count() 
      RETURNS TRIGGER AS $$
      BEGIN
        IF OLD.read = FALSE AND NEW.read = TRUE THEN
          UPDATE company_user
          SET notification_count = notification_count - 1
          WHERE company_id = NEW.company_id AND user_id = NEW.user_id;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create the insert trigger
    await queryInterface.sequelize.query(`
      CREATE TRIGGER increment_notification_trigger
      AFTER INSERT ON notification
      FOR EACH ROW
      EXECUTE FUNCTION increment_notification_count();
    `);

    // Create the update trigger
    await queryInterface.sequelize.query(`
      CREATE TRIGGER decrement_notification_trigger
      AFTER UPDATE ON notification
      FOR EACH ROW
      WHEN (OLD.read IS DISTINCT FROM NEW.read)
      EXECUTE FUNCTION decrement_notification_count();
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remove the triggers and functions
    await queryInterface.sequelize.query(
      `DROP TRIGGER IF EXISTS increment_notification_trigger ON notification;`,
    );
    await queryInterface.sequelize.query(
      `DROP TRIGGER IF EXISTS decrement_notification_trigger ON notification;`,
    );
    await queryInterface.sequelize.query(
      `DROP FUNCTION IF EXISTS increment_notification_count();`,
    );
    await queryInterface.sequelize.query(
      `DROP FUNCTION IF EXISTS decrement_notification_count();`,
    );

    // Remove the unread_notification_count column
    await queryInterface.removeColumn('company_user', 'notification_count');
  },
};
