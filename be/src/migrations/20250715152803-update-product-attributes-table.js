'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns to product_attributes
    await queryInterface.addColumn('product_attributes', 'type', {
      type: Sequelize.ENUM('color', 'size', 'material', 'custom'),
      allowNull: false,
      defaultValue: 'custom',
    });

    await queryInterface.addColumn('product_attributes', 'required', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn('product_attributes', 'sort_order', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    // Update values column to JSONB
    await queryInterface.changeColumn('product_attributes', 'values', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });

    // Add indexes
    await queryInterface.addIndex('product_attributes', ['type']);
    await queryInterface.addIndex('product_attributes', ['required']);
    await queryInterface.addIndex('product_attributes', ['sort_order']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('product_attributes', 'type');
    await queryInterface.removeColumn('product_attributes', 'required');
    await queryInterface.removeColumn('product_attributes', 'sort_order');

    // Revert values column back to ARRAY
    await queryInterface.changeColumn('product_attributes', 'values', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false,
    });
  },
};
