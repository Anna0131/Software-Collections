CREATE DATABASE IF NOT EXISTS `software_collections`;
USE software_collections;

create table course (
    `semester` int(4) UNSIGNED NOT NULL,
    `info` varchar(20) NOT NULL ,
    PRIMARY KEY (`semester`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table role (
    `role_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` varchar(30) NOT NULL ,
    PRIMARY KEY (`role_id`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table user (
    `user_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `role_id` int(10) NOT NULL ,
    `name` varchar(30) NOT NULL,
    `password` varchar(100) DEFAULT NULL,
    `email` varchar(30) DEFAULT NULL,
    `s_num` int(20) DEFAULT NULL,
    `total_credit` int(10) DEFAULT 0,
    PRIMARY KEY (`user_id`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table requirement (
    `req_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` int(10) NOT NULL ,
    `topic` varchar(300) NOT NULL ,
    `description` varchar(600) NOT NULL ,
    `awarded_credit` int(10) DEFAULT 0 ,
    `status` tinyint(1) DEFAULT 0 ,
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
    `domain` varchar(300) NULL ,
    `docker_image` varchar(300) NULL ,
    `avg_score` int(10) DEFAULT 0 ,
    `create_time` datetime NOT NULL,
    `success_upload` boolean DEFAULT FALSE,
    `rejected` boolean DEFAULT FALSE,
    `internal_port` int(5) NULL,
    `external_port` int(5) NULL,
    `view_nums` int(10) DEFAULT 0,
    `memory` int(5) NULL ,
    `storage` float(3) NULL ,
    `cpu` float(3) NULL,
    `env` varchar(300) DEFAULT NULL ,
    `volumes` varchar(300) DEFAULT NULL ,
    `set_public` boolean NULL,
    `ssl` boolean NULL,
    `container_name` varchar(100) NULL ,
    PRIMARY KEY (`software_id`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table bulletin (
    `software_id` int(10) UNSIGNED NOT NULL,
    `comment_user_id` int(10) NOT NULL ,
    `content` varchar(600) NOT NULL ,
    `create_time` datetime NOT NULL,
    PRIMARY KEY (`software_id`, `content`, `create_time`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table docker_spec (
    `docker_spec_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `spec_type` varchar(10) NOT NULL ,
    `spec_info` float(3) NOT NULL ,
    PRIMARY KEY (`docker_spec_id`) USING BTREE
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
    `val` varchar(100) NOT NULL ,
    `root_only` boolean NOT NULL,
    PRIMARY KEY (`ref_id`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table login_record (
    `account` varchar(30) NOT NULL ,
    `ip` varchar(15) NOT NULL,
    `time` datetime NOT NULL,
    `suc` boolean NOT NULL,
    PRIMARY KEY (`ip`, `time`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
create index ip_index on login_record(ip);

create table general_settings (
    `settings_name` varchar(30) NOT NULL ,
    `value` float(5) NOT NULL ,
    PRIMARY KEY (`settings_name`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* All the roles of user */
insert into role(name) values("student");
insert into role(name) values("teacher");
insert into role(name) values("admin");

/* All the links that can be used by the user */
insert into ref(name, val, root_only) values("主頁面", "main", FALSE);
insert into ref(name, val, root_only) values("使用者資訊", "user", FALSE);
insert into ref(name, val, root_only) values("申請部屬", "apply", FALSE);
insert into ref(name, val, root_only) values("開發需求", "requirement", FALSE);
insert into ref(name, val, root_only) values("審核申請", "audit", TRUE);
insert into ref(name, val, root_only) values("系統設定", "settings", TRUE);
insert into ref(name, val, root_only) values("系統文件", "tutorial", FALSE);

/* Default user */
insert into user(role_id, name, password, total_credit, s_num) values(3, "im_admin", "31004088-4938-48c2-9602-865e9f3a6781", 100, 1);

/* Default gerneral settings */
insert into general_settings values("max_application_nums", 3);
