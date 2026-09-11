-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 11, 2026 at 02:20 PM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `crib_society_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `image_url`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Signature Drinks', 'signature-drinks', 'Kreasi kopi dan racikan minuman signature Crib Society.', 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80', 1, 1, '2026-09-11 13:44:43', '2026-09-11 13:44:43'),
(2, 'Espresso Based', 'espresso-based', 'Kopi klasik berbasis espresso berkualitas tinggi.', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80', 2, 1, '2026-09-11 13:44:43', '2026-09-11 13:44:43'),
(3, 'Manual Brew', 'manual-brew', 'Seduhan kopi manual menggunakan single origin pilihan.', 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=600&q=80', 3, 1, '2026-09-11 13:44:43', '2026-09-11 13:44:43'),
(4, 'Non-Coffee', 'non-coffee', 'Varian artisan tea, matcha, dan chocolate creamy.', 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80', 4, 1, '2026-09-11 13:44:43', '2026-09-11 13:44:43'),
(5, 'Pastry & Bites', 'pastry-bites', 'Camilan manis dan gurih pendamping kopi.', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80', 5, 1, '2026-09-11 13:44:43', '2026-09-11 13:44:43');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint UNSIGNED NOT NULL,
  `order_number` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `customer_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Guest',
  `customer_phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tax_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `service_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `payment_method` enum('cash','qris','debit','transfer') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cash',
  `payment_status` enum('pending','paid','failed','refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `order_status` enum('pending','processing','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `paid_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_number`, `user_id`, `customer_name`, `customer_phone`, `subtotal`, `discount_amount`, `tax_amount`, `service_amount`, `total_amount`, `payment_method`, `payment_status`, `order_status`, `notes`, `paid_at`, `completed_at`, `cancelled_at`, `created_at`, `updated_at`) VALUES
(1, 'ORD-20260911-0001', 2, 'Rian Pradana', '081298765432', '53000.00', '0.00', '5300.00', '0.00', '58300.00', 'cash', 'paid', 'completed', 'Dine-in, Meja 04', '2026-09-11 10:15:00', '2026-09-11 10:22:00', NULL, '2026-09-11 10:14:00', '2026-09-11 13:34:35'),
(2, 'ORD-20260911-0002', 3, 'Amanda Putri', '085712349988', '32000.00', '0.00', '3200.00', '0.00', '35200.00', 'qris', 'paid', 'completed', 'Takeaway', '2026-09-11 11:30:10', '2026-09-11 11:35:00', NULL, '2026-09-11 11:30:00', '2026-09-11 13:34:35'),
(3, 'ORD-20260911-0003', 2, 'Dimas Arya', NULL, '58000.00', '0.00', '5800.00', '0.00', '63800.00', 'qris', 'paid', 'processing', 'Dine-in, Bar Area', '2026-09-11 13:02:00', NULL, NULL, '2026-09-11 13:01:00', '2026-09-11 13:34:35'),
(4, 'ORD-20260911-0004', 1, 'Bastian Test', '081122334455', '81000.00', '0.00', '8100.00', '0.00', '89100.00', 'cash', 'paid', 'completed', 'Dine-in Table 09', '2026-09-11 13:35:06', '2026-09-11 13:35:06', NULL, '2026-09-11 13:35:06', '2026-09-11 13:35:06'),
(5, 'ORD-20260911-0005', 1, 'Cancel Test', NULL, '150000.00', '0.00', '15000.00', '0.00', '165000.00', 'qris', 'paid', 'cancelled', NULL, '2026-09-11 13:35:25', NULL, '2026-09-11 13:35:24', '2026-09-11 13:35:24', '2026-09-11 13:35:24'),
(6, 'ORD-20260911-0006', 1, 'Bastian Test', '081122334455', '81000.00', '0.00', '8100.00', '0.00', '89100.00', 'cash', 'paid', 'completed', 'Dine-in Table 09', '2026-09-11 13:38:15', '2026-09-11 13:38:15', NULL, '2026-09-11 13:38:15', '2026-09-11 13:38:15'),
(7, 'ORD-20260911-0007', 1, 'Bastian Test', '081122334455', '81000.00', '0.00', '8100.00', '0.00', '89100.00', 'cash', 'paid', 'completed', 'Dine-in Table 09', '2026-09-11 14:07:17', '2026-09-11 14:07:17', NULL, '2026-09-11 14:07:17', '2026-09-11 14:07:17');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED DEFAULT NULL,
  `product_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `quantity` int NOT NULL DEFAULT '1',
  `subtotal_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `notes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `unit_price`, `quantity`, `subtotal_price`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Crib Iced White', '28000.00', 1, '28000.00', 'Less sugar', '2026-09-11 13:34:35', '2026-09-11 13:34:35'),
(2, 1, 11, 'Butter Croissant', '25000.00', 1, '25000.00', 'Warmed up', '2026-09-11 13:34:35', '2026-09-11 13:34:35'),
(3, 2, 2, 'Cloud Velvet Caramel', '32000.00', 1, '32000.00', 'Normal sweet', '2026-09-11 13:34:35', '2026-09-11 13:34:35'),
(4, 3, 9, 'Kyoto Matcha Latte', '29000.00', 1, '29000.00', 'Oat milk substitution', '2026-09-11 13:34:35', '2026-09-11 13:34:35'),
(5, 3, 10, 'Belgian Dark Chocolate', '29000.00', 1, '29000.00', 'Extra hot', '2026-09-11 13:34:35', '2026-09-11 13:34:35'),
(6, 4, 1, 'Crib Iced White', '28000.00', 2, '56000.00', 'Less sugar', '2026-09-11 13:35:06', '2026-09-11 13:35:06'),
(7, 4, 11, 'Butter Croissant', '25000.00', 1, '25000.00', 'Warm up', '2026-09-11 13:35:06', '2026-09-11 13:35:06'),
(8, 5, 3, 'Berry Charcoal Tonic', '30000.00', 5, '150000.00', NULL, '2026-09-11 13:35:24', '2026-09-11 13:35:24'),
(9, 6, 1, 'Crib Iced White', '28000.00', 2, '56000.00', 'Less sugar', '2026-09-11 13:38:15', '2026-09-11 13:38:15'),
(10, 6, 11, 'Butter Croissant', '25000.00', 1, '25000.00', 'Warm up', '2026-09-11 13:38:15', '2026-09-11 13:38:15'),
(11, 7, 1, 'Crib Iced White', '28000.00', 2, '56000.00', 'Less sugar', '2026-09-11 14:07:17', '2026-09-11 14:07:17'),
(12, 7, 11, 'Butter Croissant', '25000.00', 1, '25000.00', 'Warm up', '2026-09-11 14:07:17', '2026-09-11 14:07:17');

-- --------------------------------------------------------

--
-- Table structure for table `order_status_logs`
--

CREATE TABLE `order_status_logs` (
  `id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `previous_status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_status_logs`
--

INSERT INTO `order_status_logs` (`id`, `order_id`, `user_id`, `previous_status`, `new_status`, `reason`, `created_at`) VALUES
(1, 1, 2, NULL, 'pending', 'Order entered at POS', '2026-09-11 10:14:00'),
(2, 1, 2, 'pending', 'processing', 'Payment received via Cash', '2026-09-11 10:15:00'),
(3, 1, 2, 'processing', 'completed', 'Beverages and pastry served to table', '2026-09-11 10:22:00'),
(4, 2, 3, NULL, 'pending', 'Takeaway POS order created', '2026-09-11 11:30:00'),
(5, 2, 3, 'pending', 'processing', 'QRIS transaction confirmed', '2026-09-11 11:30:10'),
(6, 2, 3, 'processing', 'completed', 'Order picked up by customer', '2026-09-11 11:35:00'),
(7, 3, 2, NULL, 'pending', 'Order entered', '2026-09-11 13:01:00'),
(8, 3, 2, 'pending', 'processing', 'QRIS paid, barista is preparing drinks', '2026-09-11 13:02:00'),
(9, 4, 1, NULL, 'processing', 'Order initialized & payment confirmed via POS', '2026-09-11 13:35:06'),
(10, 4, 1, 'processing', 'completed', 'Order served to customer at Table 09', '2026-09-11 13:35:06'),
(11, 5, 1, NULL, 'processing', 'Order initialized & payment confirmed via POS', '2026-09-11 13:35:24'),
(12, 5, 1, 'processing', 'cancelled', 'Customer changed mind', '2026-09-11 13:35:24'),
(13, 6, 1, NULL, 'processing', 'Order initialized & payment confirmed via POS', '2026-09-11 13:38:15'),
(14, 6, 1, 'processing', 'completed', 'Order served to customer at Table 09', '2026-09-11 13:38:15'),
(15, 7, 1, NULL, 'processing', 'Order initialized & payment confirmed via POS', '2026-09-11 14:07:17'),
(16, 7, 1, 'processing', 'completed', 'Order served to customer at Table 09', '2026-09-11 14:07:17');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount_due` decimal(12,2) NOT NULL DEFAULT '0.00',
  `amount_paid` decimal(12,2) NOT NULL DEFAULT '0.00',
  `change_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `reference_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','success','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `order_id`, `payment_method`, `amount_due`, `amount_paid`, `change_amount`, `reference_no`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'cash', '58300.00', '60000.00', '1700.00', NULL, 'success', '2026-09-11 10:15:00', '2026-09-11 13:34:35'),
(2, 2, 'qris', '35200.00', '35200.00', '0.00', 'QRIS-NMID-99283411', 'success', '2026-09-11 11:30:10', '2026-09-11 13:34:35'),
(3, 3, 'qris', '63800.00', '63800.00', '0.00', 'QRIS-NMID-88192033', 'success', '2026-09-11 13:02:00', '2026-09-11 13:34:35'),
(4, 4, 'cash', '89100.00', '100000.00', '10900.00', NULL, 'success', '2026-09-11 13:35:06', '2026-09-11 13:35:06'),
(5, 5, 'qris', '165000.00', '165000.00', '0.00', NULL, 'success', '2026-09-11 13:35:24', '2026-09-11 13:35:24'),
(6, 6, 'cash', '89100.00', '100000.00', '10900.00', NULL, 'success', '2026-09-11 13:38:15', '2026-09-11 13:38:15'),
(7, 7, 'cash', '89100.00', '100000.00', '10900.00', NULL, 'success', '2026-09-11 14:07:17', '2026-09-11 14:07:17');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint UNSIGNED NOT NULL,
  `category_id` bigint UNSIGNED NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `cost_price` decimal(12,2) DEFAULT '0.00',
  `stock` int NOT NULL DEFAULT '0',
  `low_stock_threshold` int NOT NULL DEFAULT '5',
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `description`, `price`, `cost_price`, `stock`, `low_stock_threshold`, `image_url`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'Crib Iced White', 'crib-iced-white', 'Signature creamy iced latte with brown palm sugar blend.', '28000.00', '11000.00', 48, 5, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80', 'active', '2026-09-11 13:44:43', '2026-09-11 14:07:17', NULL),
(2, 1, 'Cloud Velvet Caramel', 'cloud-velvet-caramel', 'Cold brew topped with salted caramel macchiato foam.', '32000.00', '13500.00', 35, 5, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80', 'active', '2026-09-11 13:44:43', '2026-09-11 13:44:43', NULL),
(3, 1, 'Berry Charcoal Tonic', 'berry-charcoal-tonic', 'Activated charcoal, fresh wild berries, and sparkling espresso tonic.', '30000.00', '12000.00', 20, 5, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80', 'active', '2026-09-11 13:44:43', '2026-09-11 13:44:43', NULL),
(4, 2, 'Americano (Hot/Ice)', 'americano', 'Double shot espresso diluted with mineral water.', '22000.00', '6000.00', 100, 10, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80', 'active', '2026-09-11 13:44:43', '2026-09-11 13:44:43', NULL),
(5, 2, 'Caffe Latte', 'caffe-latte', 'Rich espresso paired with velvety steamed fresh milk.', '26000.00', '9500.00', 80, 10, 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=600&q=80', 'active', '2026-09-11 13:44:43', '2026-09-11 13:44:43', NULL),
(6, 2, 'Piccolo Latte', 'piccolo-latte', 'Single ristretto shot with light steamed milk, intense & sweet.', '24000.00', '8500.00', 40, 5, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80', 'active', '2026-09-11 13:44:43', '2026-09-11 13:44:43', NULL),
(7, 3, 'V60 Single Origin Gayo', 'v60-gayo', 'Clean cup with notes of peach, black tea, and citrus.', '32000.00', '14000.00', 15, 5, 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=600&q=80', 'active', '2026-09-11 13:44:43', '2026-09-11 13:44:43', NULL),
(8, 3, 'Japanese Iced Drip Flores', 'japanese-flores', 'Bright fruitiness flash-chilled over ice rocks.', '34000.00', '15000.00', 4, 5, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80', 'active', '2026-09-11 13:44:43', '2026-09-11 13:44:43', NULL),
(9, 4, 'Kyoto Matcha Latte', 'kyoto-matcha-latte', 'Ceremonial grade Uji matcha with fresh full cream milk.', '29000.00', '12500.00', 30, 5, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80', 'active', '2026-09-11 13:44:43', '2026-09-11 13:44:43', NULL),
(10, 4, 'Belgian Dark Chocolate', 'belgian-dark-chocolate', '70% dark Belgian cocoa melted with silky milk.', '29000.00', '12000.00', 25, 5, 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=600&q=80', 'active', '2026-09-11 13:44:43', '2026-09-11 13:44:43', NULL),
(11, 5, 'Butter Croissant', 'butter-croissant', 'Flaky, buttery French croissant baked fresh daily.', '25000.00', '10000.00', 11, 5, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80', 'active', '2026-09-11 13:44:43', '2026-09-11 14:07:17', NULL),
(12, 5, 'Pain au Chocolat', 'pain-au-chocolat', 'Multi-layered pastry filled with dark chocolate batons.', '28000.00', '12000.00', 3, 5, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', 'active', '2026-09-11 13:44:43', '2026-09-11 13:44:43', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `store_settings`
--

CREATE TABLE `store_settings` (
  `id` bigint UNSIGNED NOT NULL,
  `setting_key` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text COLLATE utf8mb4_unicode_ci,
  `data_type` enum('string','number','boolean','json') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'string',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `store_settings`
--

INSERT INTO `store_settings` (`id`, `setting_key`, `setting_value`, `data_type`, `description`, `updated_at`) VALUES
(1, 'tax_rate_percent', '10.0', 'number', 'Pajak Restoran PB1 (%)', '2026-09-11 13:34:35'),
(2, 'service_charge_percent', '0.0', 'number', 'Biaya Layanan Toko (%)', '2026-09-11 13:34:35'),
(3, 'default_low_stock_threshold', '5', 'number', 'Ambang batas default stok menipis', '2026-09-11 13:34:35'),
(4, 'store_name', 'Crib Society Coffee', 'string', 'Nama gerai toko', '2026-09-11 13:34:35'),
(5, 'store_address', 'Jl. Pandanaran No. 88, Semarang', 'string', 'Alamat fisik kafe', '2026-09-11 13:34:35'),
(6, 'store_phone', '+62 812-3456-7890', 'string', 'Nomor telepon resmi kafe', '2026-09-11 13:34:35'),
(7, 'receipt_footer_text', 'Thank you for vibing with Crib Society!', 'string', 'Pesan penutup pada struk kasir', '2026-09-11 13:34:35');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('owner','staff','guest') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'staff',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `status`, `avatar_url`, `remember_token`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Owner Crib Society', 'owner@cribsociety.com', '$2a$10$29ntv6jyFlYVNvz2f6lm6eV0F0PAisH6wqgUgieEyohaB3sRRCuMq', 'owner', 'active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', NULL, '2026-09-11 13:44:43', '2026-09-11 14:03:30', NULL),
(2, 'Barista Sarah (Staff)', 'sarah@cribsociety.com', '$2a$10$29ntv6jyFlYVNvz2f6lm6eV0F0PAisH6wqgUgieEyohaB3sRRCuMq', 'staff', 'active', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', NULL, '2026-09-11 13:44:43', '2026-09-11 14:03:30', NULL),
(3, 'Cashier Budi (Staff)', 'budi@cribsociety.com', '$2a$10$29ntv6jyFlYVNvz2f6lm6eV0F0PAisH6wqgUgieEyohaB3sRRCuMq', 'staff', 'active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', NULL, '2026-09-11 13:44:43', '2026-09-11 14:03:30', NULL),
(4, 'Testing User', 'user_1789135380905@cribsociety.com', '$2a$10$29ntv6jyFlYVNvz2f6lm6eV0F0PAisH6wqgUgieEyohaB3sRRCuMq', 'staff', 'active', NULL, NULL, '2026-09-11 14:03:01', '2026-09-11 14:03:30', NULL),
(5, 'Alex Staff', 'alex@cribsociety.com', '$2a$10$mXRYuJ8gmfxs4wxvmc22TOrcFPxm39NSdvypklOzsACaxDQaUpjfO', 'staff', 'active', NULL, NULL, '2026-09-11 14:09:47', '2026-09-11 14:09:47', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_categories_slug` (`slug`),
  ADD KEY `idx_categories_active_sort` (`is_active`,`sort_order`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_orders_order_number` (`order_number`),
  ADD KEY `idx_orders_status_date` (`order_status`,`created_at`),
  ADD KEY `idx_orders_user` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_items_order` (`order_id`),
  ADD KEY `idx_order_items_product` (`product_id`);

--
-- Indexes for table `order_status_logs`
--
ALTER TABLE `order_status_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status_logs_order` (`order_id`),
  ADD KEY `idx_status_logs_user` (`user_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payments_order` (`order_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_products_slug` (`slug`),
  ADD KEY `idx_products_category` (`category_id`),
  ADD KEY `idx_products_status_stock` (`status`,`stock`);

--
-- Indexes for table `store_settings`
--
ALTER TABLE `store_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_settings_key` (`setting_key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_role_status` (`role`,`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `order_status_logs`
--
ALTER TABLE `order_status_logs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `store_settings`
--
ALTER TABLE `store_settings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `order_status_logs`
--
ALTER TABLE `order_status_logs`
  ADD CONSTRAINT `fk_status_logs_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_status_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
