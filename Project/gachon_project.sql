/*
MySQL Data Transfer
Source Host: 192.168.1.231
Source Database: gachon_project
Target Host: 192.168.1.231
Target Database: gachon_project
Date: 2020-07-01 ¿ÀÈÄ 6:29:35
*/

SET FOREIGN_KEY_CHECKS=0;
-- ----------------------------
-- Table structure for attendance
-- ----------------------------
CREATE TABLE `attendance` (
  `attendance_no` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` char(40) NOT NULL,
  `course_no` int(40) NOT NULL,
  `payment_no` int(11) DEFAULT NULL,
  `order` int(11) NOT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  PRIMARY KEY (`attendance_no`),
  KEY `user_id` (`user_id`),
  KEY `course_no` (`course_no`),
  KEY `payment_no` (`payment_no`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`course_no`) REFERENCES `course` (`course_no`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `attendance_ibfk_3` FOREIGN KEY (`payment_no`) REFERENCES `payment` (`payment_no`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9467 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for attendance_teacher_key
-- ----------------------------
CREATE TABLE `attendance_teacher_key` (
  `user_id` char(40) NOT NULL,
  `type` char(255) NOT NULL,
  `token` char(255) NOT NULL,
  PRIMARY KEY (`user_id`,`type`),
  UNIQUE KEY `token` (`token`),
  CONSTRAINT `attendance_teacher_key_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for board_info
-- ----------------------------
CREATE TABLE `board_info` (
  `board_id` char(20) NOT NULL,
  `board_name` char(50) NOT NULL,
  `board_read_permission` int(11) NOT NULL,
  `board_write_permission` int(11) NOT NULL,
  PRIMARY KEY (`board_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for branch
-- ----------------------------
CREATE TABLE `branch` (
  `branch_id` char(40) NOT NULL,
  `branch_name` char(255) NOT NULL,
  PRIMARY KEY (`branch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for course
-- ----------------------------
CREATE TABLE `course` (
  `course_no` int(11) NOT NULL AUTO_INCREMENT,
  `branch_id` char(40) NOT NULL,
  `course_name` char(255) NOT NULL,
  `price` int(11) NOT NULL DEFAULT 100000,
  `memo` text NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`course_no`),
  UNIQUE KEY `branch_id` (`branch_id`,`course_name`),
  CONSTRAINT `course_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`branch_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for iot_data_n
-- ----------------------------
CREATE TABLE `iot_data_n` (
  `no` int(11) NOT NULL AUTO_INCREMENT,
  `application_no` int(11) NOT NULL,
  `key` char(32) NOT NULL,
  `value` varchar(255) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp(),
  `device` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`no`),
  KEY `date` (`date`),
  KEY `application_no` (`application_no`,`key`),
  CONSTRAINT `iot_data_n_ibfk_1` FOREIGN KEY (`application_no`, `key`) REFERENCES `iot_value_n` (`application_no`, `key_name`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=621659 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for iot_last_update
-- ----------------------------
CREATE TABLE `iot_last_update` (
  `application_no` int(11) NOT NULL,
  `last_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`application_no`),
  CONSTRAINT `iot_last_update_ibfk_1` FOREIGN KEY (`application_no`) REFERENCES `iot_token_n` (`application_no`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for iot_statistics_n2
-- ----------------------------
CREATE TABLE `iot_statistics_n2` (
  `application_no` int(11) NOT NULL,
  `key` char(32) NOT NULL,
  `date` date NOT NULL,
  `time` int(11) NOT NULL,
  `statistics_method` char(5) NOT NULL,
  `data` int(11) NOT NULL,
  PRIMARY KEY (`application_no`,`key`,`date`,`time`,`statistics_method`),
  CONSTRAINT `iot_statistics_n2_ibfk_1` FOREIGN KEY (`application_no`, `key`) REFERENCES `iot_value_n` (`application_no`, `key_name`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for iot_token_n
-- ----------------------------
CREATE TABLE `iot_token_n` (
  `application_no` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` char(40) NOT NULL,
  `application_name` varchar(255) NOT NULL,
  `date` timestamp NULL DEFAULT current_timestamp(),
  `description` varchar(512) DEFAULT NULL,
  `token` char(64) NOT NULL,
  `layout` text NOT NULL,
  PRIMARY KEY (`application_no`),
  UNIQUE KEY `token` (`token`),
  UNIQUE KEY `application_name` (`application_name`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `iot_token_n_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=304 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for iot_value_n
-- ----------------------------
CREATE TABLE `iot_value_n` (
  `key_no` int(11) NOT NULL AUTO_INCREMENT,
  `application_no` int(11) NOT NULL,
  `key_name` char(32) NOT NULL,
  `type` int(11) NOT NULL,
  `description` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`key_no`),
  UNIQUE KEY `application_no_2` (`application_no`,`key_name`),
  KEY `application_no` (`application_no`),
  KEY `key_no` (`key_no`,`application_no`),
  CONSTRAINT `iot_value_n_ibfk_1` FOREIGN KEY (`application_no`) REFERENCES `iot_token_n` (`application_no`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2484 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for log
-- ----------------------------
CREATE TABLE `log` (
  `no` int(11) NOT NULL AUTO_INCREMENT,
  `time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `user_id` char(40) NOT NULL,
  `title` char(255) NOT NULL,
  `content` text DEFAULT NULL,
  `remove` int(11) DEFAULT 0,
  PRIMARY KEY (`no`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for post
-- ----------------------------
CREATE TABLE `post` (
  `no` int(11) NOT NULL AUTO_INCREMENT,
  `board_id` char(20) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `title` char(255) NOT NULL,
  `content` text NOT NULL,
  `writer` char(40) NOT NULL,
  PRIMARY KEY (`no`,`board_id`),
  KEY `writer` (`writer`),
  KEY `board_id` (`board_id`),
  CONSTRAINT `post_ibfk_2` FOREIGN KEY (`writer`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `post_ibfk_3` FOREIGN KEY (`board_id`) REFERENCES `board_info` (`board_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for session
-- ----------------------------
CREATE TABLE `session` (
  `phpsessid` char(30) NOT NULL,
  `ip` char(70) NOT NULL,
  `user_agent` char(255) NOT NULL,
  `data` varchar(500) NOT NULL,
  `start` int(11) NOT NULL DEFAULT 0,
  `expiry` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`phpsessid`,`ip`,`user_agent`)
) ENGINE=MEMORY DEFAULT CHARSET=utf8;
-- ----------------------------
-- Table structure for user
-- ----------------------------
CREATE TABLE `user` (
  `id` char(40) NOT NULL,
  `password` varchar(300) NOT NULL DEFAULT 'no password',
  `uuid` char(100) DEFAULT NULL,
  `name` char(40) NOT NULL DEFAULT 'no name',
  `phone` char(30) DEFAULT NULL,
  `address` char(255) DEFAULT NULL,
  `email` char(255) DEFAULT '',
  `branch_id` char(40) NOT NULL,
  `level` int(11) NOT NULL,
  `log_check` int(11) NOT NULL DEFAULT -1,
  `secondary_name` char(40) DEFAULT NULL,
  `secondary_phone` char(30) DEFAULT NULL,
  `memo` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `branch_id` (`branch_id`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`branch_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

