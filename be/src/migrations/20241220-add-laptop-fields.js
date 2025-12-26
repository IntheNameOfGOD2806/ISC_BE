'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new fields to products table
    await queryInterface.addColumn('products', 'brand', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('products', 'model', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('products', 'condition', {
      type: Sequelize.ENUM('new', 'like-new', 'used', 'refurbished'),
      defaultValue: 'new',
    });

    await queryInterface.addColumn('products', 'warranty_months', {
      type: Sequelize.INTEGER,
      defaultValue: 12,
    });

    await queryInterface.addColumn('products', 'specifications', {
      type: Sequelize.JSONB,
      defaultValue: {},
    });

    // Add new fields to product_variants table
    await queryInterface.addColumn('product_variants', 'display_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('product_variants', 'sort_order', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.addColumn('product_variants', 'is_default', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn('product_variants', 'is_available', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });

    // Create warranty_packages table
    await queryInterface.createTable('warranty_packages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      duration_months: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      terms: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      coverage: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Create product_warranties junction table
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
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add indexes
    await queryInterface.addIndex('products', ['brand']);
    await queryInterface.addIndex('products', ['model']);
    await queryInterface.addIndex('products', ['condition']);
    await queryInterface.addIndex('product_variants', ['is_default']);
    await queryInterface.addIndex('product_variants', ['is_available']);
    await queryInterface.addIndex('product_warranties', ['product_id']);
    await queryInterface.addIndex('product_warranties', [
      'warranty_package_id',
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes
    await queryInterface.removeIndex('products', ['brand']);
    await queryInterface.removeIndex('products', ['model']);
    await queryInterface.removeIndex('products', ['condition']);
    await queryInterface.removeIndex('product_variants', ['is_default']);
    await queryInterface.removeIndex('product_variants', ['is_available']);
    await queryInterface.removeIndex('product_warranties', ['product_id']);
    await queryInterface.removeIndex('product_warranties', [
      'warranty_package_id',
    ]);

    // Drop tables
    await queryInterface.dropTable('product_warranties');
    await queryInterface.dropTable('warranty_packages');

    // Remove columns from product_variants
    await queryInterface.removeColumn('product_variants', 'display_name');
    await queryInterface.removeColumn('product_variants', 'sort_order');
    await queryInterface.removeColumn('product_variants', 'is_default');
    await queryInterface.removeColumn('product_variants', 'is_available');

    // Remove columns from products
    await queryInterface.removeColumn('products', 'brand');
    await queryInterface.removeColumn('products', 'model');
    await queryInterface.removeColumn('products', 'condition');
    await queryInterface.removeColumn('products', 'warranty_months');
    await queryInterface.removeColumn('products', 'specifications');
  },
};
