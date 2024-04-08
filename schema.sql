# CREATE DATABASE `software_collections`;

create table role (
    `role_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` varchar(30) NOT NULL ,
    PRIMARY KEY (`role_id`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table user (
    `user_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `role_id` int(10) NOT NULL ,
    PRIMARY KEY (`user_id`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table admin (
    `admin_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` int(10) NOT NULL ,
    `total_credit` int(10) NOT NULL ,
    PRIMARY KEY (`admin_id`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table teacher (
    `teacher_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` int(10) NOT NULL ,
    `total_credit` int(10) NOT NULL ,
    PRIMARY KEY (`teacher_id`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table student (
    `stu_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` int(10) NOT NULL ,
    `stu_num` int(10) NOT NULL ,
    `total_credit` int(10) NOT NULL ,
    PRIMARY KEY (`stu_id`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table login_record (
    `login_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` int(10) NOT NULL ,
    `time` datetime NOT NULL,
    PRIMARY KEY (`login_id`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table requirement (
    `req_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` int(10) NOT NULL ,
    `awarded_credit` varchar(30) NOT NULL ,
    `time` datetime NOT NULL,
    PRIMARY KEY (`req_id`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table comment (
    `comment_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` int(10) NOT NULL ,
    `time` datetime NOT NULL,
    PRIMARY KEY (`comment_id`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table software (
    `software_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `owner_user_id` int(10) NOT NULL ,
    `topic` varchar(300) NOT NULL ,
    `description` varchar(300) NOT NULL ,
    `avg_score` int(10) DEFAULT 0 ,
    `create_time` datetime NOT NULL,
    `success_upload` int(1) DEFAULT 0,
    PRIMARY KEY (`software_id`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table tag_type (
    `tt_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL ,
    PRIMARY KEY (`tt_id`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table tag (
    `tag_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `tt_id` int(10) NOT NULL ,
    `software_id` int(10) NOT NULL ,
    PRIMARY KEY (`tag_id`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
