CREATE DATABASE IF NOT EXISTS `software_collections`;
USE software_collections;

create table role (
    `role_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` varchar(30) NOT NULL ,
    PRIMARY KEY (`role_id`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table user (
    `user_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `role_id` int(10) NOT NULL ,
    `name` varchar(30) NOT NULL,
    `password` varchar(30) DEFAULT NULL,
    `email` varchar(30) DEFAULT NULL,
    `s_num` int(20) DEFAULT NULL,
    `total_credit` int(10) DEFAULT 0,
    PRIMARY KEY (`user_id`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table login_record (
    `login_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` int(10) NOT NULL ,
    `suc` int(1) NOT NULL ,
    `time` datetime NOT NULL,
    PRIMARY KEY (`login_id`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table requirement (
    `req_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` int(10) NOT NULL ,
    `topic` varchar(300) NOT NULL ,
    `description` varchar(600) NOT NULL ,
    `awarded_credit` int(10) DEFAULT 0 ,
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
    `description` varchar(600) NOT NULL ,
    `domain` varchar(300) NOT NULL ,
    `docker_image` varchar(300) NOT NULL ,
    `avg_score` int(10) DEFAULT 0 ,
    `create_time` datetime NOT NULL,
    `success_upload` boolean DEFAULT FALSE,
    `internal_port` int(5) NULL,
    `external_port` int(5) NULL,
    `view_nums` int(10) DEFAULT 0,
    `memory` int(5) NULL ,
    `storage` float(3) NULL ,
    `cpu` float(3) NULL,
    PRIMARY KEY (`software_id`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table bulletin (
    `software_id` int(10) UNSIGNED NOT NULL,
    `comment_user_id` int(10) NOT NULL ,
    `content` varchar(600) NOT NULL ,
    `create_time` datetime NOT NULL,
    PRIMARY KEY (`software_id`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*
create table tag_type (
    `tt_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL ,
    PRIMARY KEY (`tt_id`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
*/

create table tag (
    `tag_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `software_id` int(10) NOT NULL ,
    `name` varchar(100) NOT NULL ,
    PRIMARY KEY (`tag_id`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table ref (
    `ref_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL ,
    `root_only` boolean NOT NULL,
    PRIMARY KEY (`ref_id`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

insert into role(name) values("admin");
insert into role(name) values("teacher");
insert into role(name) values("student");

insert into ref(name, root_only) values("main", FALSE);
insert into ref(name, root_only) values("user", FALSE);
insert into ref(name, root_only) values("apply", FALSE);
insert into ref(name, root_only) values("requirement", FALSE);
insert into ref(name, root_only) values("account", TRUE);
insert into ref(name, root_only) values("toturial", FALSE);
