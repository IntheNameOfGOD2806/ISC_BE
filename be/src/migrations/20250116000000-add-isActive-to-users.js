'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'isActive', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    });

    // Update existing users to be active by default
    await queryInterface.sequelize.query(
      'UPDATE users SET "isActive" = true WHERE "isActive" IS NULL'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'isActive');
  },
};
