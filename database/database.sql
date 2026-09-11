-- ============================================================================
-- Crib Society Coffee — Database Structure & Seed Data
-- Target Engine : MySQL 8.0+ / MariaDB 10.5+
-- Charset       : utf8mb4 / utf8mb4_unicode_ci
-- Source of Truth: docs/DATABASE-SPEC.md & docs/BUSINESS-RULES.md
-- ============================================================================

-- Disable foreign key checks while setting up schema
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ----------------------------------------------------------------------------
-- 0. Database Creation
-- ----------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `crib_society_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `crib_society_db`;

-- Drop existing tables to ensure clean rebuild
DROP TABLE IF EXISTS `order_status_logs`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `store_settings`;

-- ----------------------------------------------------------------------------
-- 1. Table: users
-- ----------------------------------------------------------------------------
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('owner', 'staff', 'guest') NOT NULL DEFAULT 'staff',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `avatar_url` VARCHAR(255) NULL DEFAULT NULL,
  `remember_token` VARCHAR(100) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`),
  KEY `idx_users_role_status` (`role`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. Table: categories
-- ----------------------------------------------------------------------------
CREATE TABLE `categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL,
  `description` TEXT NULL,
  `image_url` VARCHAR(255) NULL DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_categories_slug` (`slug`),
  KEY `idx_categories_active_sort` (`is_active`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Table: products
-- ----------------------------------------------------------------------------
CREATE TABLE `products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(180) NOT NULL,
  `description` TEXT NULL,
  `price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `cost_price` DECIMAL(12, 2) NULL DEFAULT 0.00,
  `stock` INT NOT NULL DEFAULT 0,
  `low_stock_threshold` INT NOT NULL DEFAULT 5,
  `image_url` VARCHAR(255) NULL DEFAULT NULL,
  `status` ENUM('active', 'inactive', 'archived') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_products_slug` (`slug`),
  KEY `idx_products_category` (`category_id`),
  KEY `idx_products_status_stock` (`status`, `stock`),
  CONSTRAINT `fk_products_category`
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. Table: orders
-- ----------------------------------------------------------------------------
CREATE TABLE `orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_number` VARCHAR(32) NOT NULL,
  `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `customer_name` VARCHAR(100) NULL DEFAULT 'Guest',
  `customer_phone` VARCHAR(30) NULL DEFAULT NULL,
  `subtotal` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `discount_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `tax_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `service_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `payment_method` ENUM('cash', 'qris', 'debit', 'transfer') NOT NULL DEFAULT 'cash',
  `payment_status` ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  `order_status` ENUM('pending', 'processing', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  `notes` TEXT NULL,
  `paid_at` TIMESTAMP NULL DEFAULT NULL,
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  `cancelled_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_orders_order_number` (`order_number`),
  KEY `idx_orders_status_date` (`order_status`, `created_at`),
  KEY `idx_orders_user` (`user_id`),
  CONSTRAINT `fk_orders_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. Table: order_items
-- ----------------------------------------------------------------------------
CREATE TABLE `order_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `product_name` VARCHAR(150) NOT NULL,
  `unit_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `quantity` INT NOT NULL DEFAULT 1,
  `subtotal_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `notes` VARCHAR(255) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order` (`order_id`),
  KEY `idx_order_items_product` (`product_id`),
  CONSTRAINT `fk_order_items_order`
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_order_items_product`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. Table: payments
-- ----------------------------------------------------------------------------
CREATE TABLE `payments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL,
  `amount_due` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `amount_paid` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `change_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `reference_no` VARCHAR(100) NULL DEFAULT NULL,
  `status` ENUM('pending', 'success', 'failed') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payments_order` (`order_id`),
  CONSTRAINT `fk_payments_order`
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. Table: order_status_logs
-- ----------------------------------------------------------------------------
CREATE TABLE `order_status_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `previous_status` VARCHAR(30) NULL DEFAULT NULL,
  `new_status` VARCHAR(30) NOT NULL,
  `reason` TEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status_logs_order` (`order_id`),
  KEY `idx_status_logs_user` (`user_id`),
  CONSTRAINT `fk_status_logs_order`
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_status_logs_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. Table: store_settings
-- ----------------------------------------------------------------------------
CREATE TABLE `store_settings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(80) NOT NULL,
  `setting_value` TEXT NULL,
  `data_type` ENUM('string', 'number', 'boolean', 'json') NOT NULL DEFAULT 'string',
  `description` VARCHAR(255) NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_settings_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enable foreign keys back
SET FOREIGN_KEY_CHECKS = 1;


-- ============================================================================
-- SEED DATA
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Seed: store_settings
-- ----------------------------------------------------------------------------
INSERT INTO `store_settings` (`setting_key`, `setting_value`, `data_type`, `description`) VALUES
('tax_rate_percent', '10.0', 'number', 'Pajak Restoran PB1 (%)'),
('service_charge_percent', '0.0', 'number', 'Biaya Layanan Toko (%)'),
('default_low_stock_threshold', '5', 'number', 'Ambang batas default stok menipis'),
('store_name', 'Crib Society Coffee', 'string', 'Nama gerai toko'),
('store_address', 'Jl. Pandanaran No. 88, Semarang', 'string', 'Alamat fisik kafe'),
('store_phone', '+62 812-3456-7890', 'string', 'Nomor telepon resmi kafe'),
('receipt_footer_text', 'Thank you for vibing with Crib Society!', 'string', 'Pesan penutup pada struk kasir');

-- ----------------------------------------------------------------------------
-- Seed: users (Default password: "password123" -> bcrypt hash)
-- ----------------------------------------------------------------------------
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `status`, `avatar_url`) VALUES
(1, 'Owner Crib Society', 'owner@cribsociety.com', '$2a$10$29ntv6jyFlYVNvz2f6lm6eV0F0PAisH6wqgUgieEyohaB3sRRCuMq', 'owner', 'active', '/avatars/owner.png'),
(2, 'Barista Sarah (Staff)', 'sarah@cribsociety.com', '$2a$10$29ntv6jyFlYVNvz2f6lm6eV0F0PAisH6wqgUgieEyohaB3sRRCuMq', 'staff', 'active', '/avatars/sarah.png'),
(3, 'Cashier Budi (Staff)', 'budi@cribsociety.com', '$2a$10$29ntv6jyFlYVNvz2f6lm6eV0F0PAisH6wqgUgieEyohaB3sRRCuMq', 'staff', 'active', '/avatars/budi.png');

-- ----------------------------------------------------------------------------
-- Seed: categories
-- ----------------------------------------------------------------------------
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `image_url`, `sort_order`, `is_active`) VALUES
(1, 'Signature Drinks', 'signature-drinks', 'Kreasi kopi dan racikan minuman signature Crib Society.', '/categories/signature.jpg', 1, TRUE),
(2, 'Espresso Based', 'espresso-based', 'Kopi klasik berbasis espresso berkualitas tinggi.', '/categories/espresso.jpg', 2, TRUE),
(3, 'Manual Brew', 'manual-brew', 'Seduhan kopi manual menggunakan single origin pilihan.', '/categories/manual-brew.jpg', 3, TRUE),
(4, 'Non-Coffee', 'non-coffee', 'Varian artisan tea, matcha, dan chocolate creamy.', '/categories/non-coffee.jpg', 4, TRUE),
(5, 'Pastry & Bites', 'pastry-bites', 'Camilan manis dan gurih pendamping kopi.', '/categories/pastry.jpg', 5, TRUE);

-- ----------------------------------------------------------------------------
-- Seed: products
-- ----------------------------------------------------------------------------
INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `description`, `price`, `cost_price`, `stock`, `low_stock_threshold`, `image_url`, `status`) VALUES
-- Signature Drinks
(1, 1, 'Crib Iced White', 'crib-iced-white', 'Signature creamy iced latte with brown palm sugar blend.', 28000.00, 11000.00, 50, 5, '/products/crib-iced-white.jpg', 'active'),
(2, 1, 'Cloud Velvet Caramel', 'cloud-velvet-caramel', 'Cold brew topped with salted caramel macchiato foam.', 32000.00, 13500.00, 35, 5, '/products/cloud-velvet.jpg', 'active'),
(3, 1, 'Berry Charcoal Tonic', 'berry-charcoal-tonic', 'Activated charcoal, fresh wild berries, and sparkling espresso tonic.', 30000.00, 12000.00, 20, 5, '/products/berry-tonic.jpg', 'active'),

-- Espresso Based
(4, 2, 'Americano (Hot/Ice)', 'americano', 'Double shot espresso diluted with mineral water.', 22000.00, 6000.00, 100, 10, '/products/americano.jpg', 'active'),
(5, 2, 'Caffe Latte', 'caffe-latte', 'Rich espresso paired with velvety steamed fresh milk.', 26000.00, 9500.00, 80, 10, '/products/latte.jpg', 'active'),
(6, 2, 'Piccolo Latte', 'piccolo-latte', 'Single ristretto shot with light steamed milk, intense & sweet.', 24000.00, 8500.00, 40, 5, '/products/piccolo.jpg', 'active'),

-- Manual Brew
(7, 3, 'V60 Single Origin Gayo', 'v60-gayo', 'Clean cup with notes of peach, black tea, and citrus.', 32000.00, 14000.00, 15, 5, '/products/v60-gayo.jpg', 'active'),
(8, 3, 'Japanese Iced Drip Flores', 'japanese-flores', 'Bright fruitiness flash-chilled over ice rocks.', 34000.00, 15000.00, 4, 5, '/products/japanese-flores.jpg', 'active'),

-- Non-Coffee
(9, 4, 'Kyoto Matcha Latte', 'kyoto-matcha-latte', 'Ceremonial grade Uji matcha with fresh full cream milk.', 29000.00, 12500.00, 30, 5, '/products/matcha.jpg', 'active'),
(10, 4, 'Belgian Dark Chocolate', 'belgian-dark-chocolate', '70% dark Belgian cocoa melted with silky milk.', 29000.00, 12000.00, 25, 5, '/products/chocolate.jpg', 'active'),

-- Pastry & Bites
(11, 5, 'Butter Croissant', 'butter-croissant', 'Flaky, buttery French croissant baked fresh daily.', 25000.00, 10000.00, 12, 5, '/products/croissant.jpg', 'active'),
(12, 5, 'Pain au Chocolat', 'pain-au-chocolat', 'Multi-layered pastry filled with dark chocolate batons.', 28000.00, 12000.00, 3, 5, '/products/pain-au-chocolat.jpg', 'active');

-- ----------------------------------------------------------------------------
-- Seed: Sample Orders & Items
-- ----------------------------------------------------------------------------

-- Order 1: Completed Cash Order
INSERT INTO `orders` (
  `id`, `order_number`, `user_id`, `customer_name`, `customer_phone`,
  `subtotal`, `discount_amount`, `tax_amount`, `service_amount`, `total_amount`,
  `payment_method`, `payment_status`, `order_status`, `notes`,
  `paid_at`, `completed_at`, `created_at`
) VALUES (
  1, 'ORD-20260911-0001', 2, 'Rian Pradana', '081298765432',
  53000.00, 0.00, 5300.00, 0.00, 58300.00,
  'cash', 'paid', 'completed', 'Dine-in, Meja 04',
  '2026-09-11 10:15:00', '2026-09-11 10:22:00', '2026-09-11 10:14:00'
);

INSERT INTO `order_items` (`order_id`, `product_id`, `product_name`, `unit_price`, `quantity`, `subtotal_price`, `notes`) VALUES
(1, 1, 'Crib Iced White', 28000.00, 1, 28000.00, 'Less sugar'),
(1, 11, 'Butter Croissant', 25000.00, 1, 25000.00, 'Warmed up');

INSERT INTO `payments` (`order_id`, `payment_method`, `amount_due`, `amount_paid`, `change_amount`, `reference_no`, `status`, `created_at`) VALUES
(1, 'cash', 58300.00, 60000.00, 1700.00, NULL, 'success', '2026-09-11 10:15:00');

INSERT INTO `order_status_logs` (`order_id`, `user_id`, `previous_status`, `new_status`, `reason`, `created_at`) VALUES
(1, 2, NULL, 'pending', 'Order entered at POS', '2026-09-11 10:14:00'),
(1, 2, 'pending', 'processing', 'Payment received via Cash', '2026-09-11 10:15:00'),
(1, 2, 'processing', 'completed', 'Beverages and pastry served to table', '2026-09-11 10:22:00');

-- Order 2: Completed QRIS Order
INSERT INTO `orders` (
  `id`, `order_number`, `user_id`, `customer_name`, `customer_phone`,
  `subtotal`, `discount_amount`, `tax_amount`, `service_amount`, `total_amount`,
  `payment_method`, `payment_status`, `order_status`, `notes`,
  `paid_at`, `completed_at`, `created_at`
) VALUES (
  2, 'ORD-20260911-0002', 3, 'Amanda Putri', '085712349988',
  32000.00, 0.00, 3200.00, 0.00, 35200.00,
  'qris', 'paid', 'completed', 'Takeaway',
  '2026-09-11 11:30:10', '2026-09-11 11:35:00', '2026-09-11 11:30:00'
);

INSERT INTO `order_items` (`order_id`, `product_id`, `product_name`, `unit_price`, `quantity`, `subtotal_price`, `notes`) VALUES
(2, 2, 'Cloud Velvet Caramel', 32000.00, 1, 32000.00, 'Normal sweet');

INSERT INTO `payments` (`order_id`, `payment_method`, `amount_due`, `amount_paid`, `change_amount`, `reference_no`, `status`, `created_at`) VALUES
(2, 'qris', 35200.00, 35200.00, 0.00, 'QRIS-NMID-99283411', 'success', '2026-09-11 11:30:10');

INSERT INTO `order_status_logs` (`order_id`, `user_id`, `previous_status`, `new_status`, `reason`, `created_at`) VALUES
(2, 3, NULL, 'pending', 'Takeaway POS order created', '2026-09-11 11:30:00'),
(2, 3, 'pending', 'processing', 'QRIS transaction confirmed', '2026-09-11 11:30:10'),
(2, 3, 'processing', 'completed', 'Order picked up by customer', '2026-09-11 11:35:00');

-- Order 3: Active Brewing Order (Processing)
INSERT INTO `orders` (
  `id`, `order_number`, `user_id`, `customer_name`, `customer_phone`,
  `subtotal`, `discount_amount`, `tax_amount`, `service_amount`, `total_amount`,
  `payment_method`, `payment_status`, `order_status`, `notes`,
  `paid_at`, `completed_at`, `created_at`
) VALUES (
  3, 'ORD-20260911-0003', 2, 'Dimas Arya', NULL,
  58000.00, 0.00, 5800.00, 0.00, 63800.00,
  'qris', 'paid', 'processing', 'Dine-in, Bar Area',
  '2026-09-11 13:02:00', NULL, '2026-09-11 13:01:00'
);

INSERT INTO `order_items` (`order_id`, `product_id`, `product_name`, `unit_price`, `quantity`, `subtotal_price`, `notes`) VALUES
(3, 9, 'Kyoto Matcha Latte', 29000.00, 1, 29000.00, 'Oat milk substitution'),
(3, 10, 'Belgian Dark Chocolate', 29000.00, 1, 29000.00, 'Extra hot');

INSERT INTO `payments` (`order_id`, `payment_method`, `amount_due`, `amount_paid`, `change_amount`, `reference_no`, `status`, `created_at`) VALUES
(3, 'qris', 63800.00, 63800.00, 0.00, 'QRIS-NMID-88192033', 'success', '2026-09-11 13:02:00');

INSERT INTO `order_status_logs` (`order_id`, `user_id`, `previous_status`, `new_status`, `reason`, `created_at`) VALUES
(3, 2, NULL, 'pending', 'Order entered', '2026-09-11 13:01:00'),
(3, 2, 'pending', 'processing', 'QRIS paid, barista is preparing drinks', '2026-09-11 13:02:00');

-- ----------------------------------------------------------------------------
-- Reset Auto-Increment Counters
-- ----------------------------------------------------------------------------
ALTER TABLE `users` AUTO_INCREMENT = 4;
ALTER TABLE `categories` AUTO_INCREMENT = 6;
ALTER TABLE `products` AUTO_INCREMENT = 13;
ALTER TABLE `orders` AUTO_INCREMENT = 4;
ALTER TABLE `order_items` AUTO_INCREMENT = 6;
ALTER TABLE `payments` AUTO_INCREMENT = 4;
ALTER TABLE `order_status_logs` AUTO_INCREMENT = 8;
ALTER TABLE `store_settings` AUTO_INCREMENT = 8;
