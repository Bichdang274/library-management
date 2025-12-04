DROP DATABASE IF EXISTS library_management;
CREATE DATABASE library_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE library_management;


CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
);

LOCK TABLES `categories` WRITE;
INSERT INTO `categories` VALUES (2,'Fantasy'),(3,'History'),(5,'Non-Fiction'),(4,'Programming'),(1,'Science Fiction');
UNLOCK TABLES;


CREATE TABLE `readers` (
  `reader_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`reader_id`),
  UNIQUE KEY `email` (`email`)
);

LOCK TABLES `readers` WRITE;
INSERT INTO `readers` VALUES (1,'Nguyễn Văn An','an.nguyen@gmail.com','0901112222','123 Đường A, Quận 1','2025-11-13 08:27:28'),(2,'Trần Thị Bình','binh.tran@gmail.com','0903334444','456 Phố B, Quận 2','2025-11-13 08:27:28'),(3,'Lê Hoàng Cảnh','canh.le@gmail.com','0905556666','789 Hẻm C, Quận 3','2025-11-13 08:27:28');
UNLOCK TABLES;


CREATE TABLE `users` (
  `user_id` int NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `quota` int DEFAULT '5',
  `date_created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `readers` (`reader_id`) ON DELETE CASCADE
);

LOCK TABLES `users` WRITE;
INSERT INTO `users` VALUES (1,'nguyenvanan',5,'2025-11-13 08:32:45'),(2,'tranthibinh',5,'2025-11-13 08:32:45'),(3,'lehoangcanh',3,'2025-11-13 08:32:45');
UNLOCK TABLES;


CREATE TABLE `managers` (
  `manager_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`manager_id`),
  UNIQUE KEY `email` (`email`)
);

LOCK TABLES `managers` WRITE;
INSERT INTO `managers` VALUES (1,'Ngô Công Anh','crazyguyfps@gmail.com','ngoconganh',NULL);
UNLOCK TABLES;


CREATE TABLE `books` (
  `book_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `author` varchar(150) DEFAULT NULL,
  `publisher` varchar(150) DEFAULT NULL,
  `year_published` int DEFAULT NULL,
  `category_id` int NOT NULL,
  `total_copies` int DEFAULT '0',
  `available_copies` int DEFAULT '0',
  `image_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`book_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `books_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

LOCK TABLES `books` WRITE;
INSERT INTO `books` VALUES 
(1,'Dune','Frank Herbert','Ace Books',1965,1,10,8,NULL),
(2,'Harry Potter and the Sorcerer\'s Stone','J.K. Rowling','Bloomsbury',1997,2,15,15,NULL),
(3,'Clean Code','Robert C. Martin','Prentice Hall',2008,4,5,5,NULL),
(4,'Sapiens: A Brief History of Humankind','Yuval Noah Harari','Harper',2011,5,8,7,NULL),
(5,'The Hobbit','J.R.R. Tolkien','Allen & Unwin',1937,2,12,12,NULL);
UNLOCK TABLES;


CREATE TABLE `borrowings` (
  `borrow_id` int NOT NULL AUTO_INCREMENT,
  `reader_id` int NOT NULL,
  `book_id` int NOT NULL,
  `borrow_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `due_date` date NOT NULL,
  `status` enum('BORROWED','RETURNED','OVERDUE') NOT NULL,
  PRIMARY KEY (`borrow_id`),
  KEY `reader_id` (`reader_id`),
  KEY `book_id` (`book_id`),
  CONSTRAINT `borrowings_ibfk_1` FOREIGN KEY (`reader_id`) REFERENCES `readers` (`reader_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `borrowings_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

LOCK TABLES `borrowings` WRITE;
INSERT INTO `borrowings` VALUES (1,1,1,'2025-11-01',NULL,'2025-11-15','BORROWED'),(2,2,4,'2025-10-20',NULL,'2025-11-03','OVERDUE'),(3,1,5,'2025-10-10','2025-10-20','2025-10-24','RETURNED');
UNLOCK TABLES;





