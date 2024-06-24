create table general_settings (
    `settings_name` varchar(30) NOT NULL ,
    `value` float(5) NOT NULL ,
    PRIMARY KEY (`settings_name`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
insert into general_settings values("max_application_nums", 3);
