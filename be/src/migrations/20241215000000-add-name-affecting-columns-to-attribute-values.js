'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns to attribute_values table
    await queryInterface.addColumn('attribute_values', 'affects_name', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this attribute value affects the product name',
    });

    await queryInterface.addColumn('attribute_values', 'name_template', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Template for product name (e.g., "I9", "RTX 4080", "32GB")',
    });

    console.log(
      '✅ Added affects_name and name_template columns to attribute_values table'
    );
  },

  async down(queryInterface, Sequelize) {
    // Remove the columns if we need to rollback
    await queryInterface.removeColumn('attribute_values', 'affects_name');
    await queryInterface.removeColumn('attribute_values', 'name_template');

    console.log(
      '✅ Removed affects_name and name_template columns from attribute_values table'
    );
  },
};
