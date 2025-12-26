'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_warranties', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      warranty_package_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'warranty_packages',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex('product_warranties', ['product_id']);
    await queryInterface.addIndex('product_warranties', [
      'warranty_package_id',
    ]);
    await queryInterface.addIndex('product_warranties', ['is_default']);

    // Add unique constraint to prevent duplicates
    await queryInterface.addIndex(
      'product_warranties',
      ['product_id', 'warranty_package_id'],
      {
        unique: true,
        name: 'unique_product_warranty',
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('product_warranties');
  },
};
