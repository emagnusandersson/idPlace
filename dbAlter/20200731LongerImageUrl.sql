

ALTER TABLE taxi_user MODIFY COLUMN image varchar(512) CHARSET utf8 NOT NULL DEFAULT '';
ALTER TABLE transport_user MODIFY COLUMN image varchar(512) CHARSET utf8 NOT NULL DEFAULT '';
ALTER TABLE cleaner_user MODIFY COLUMN image varchar(512) CHARSET utf8 NOT NULL DEFAULT '';
ALTER TABLE windowcleaner_user MODIFY COLUMN image varchar(512) CHARSET utf8 NOT NULL DEFAULT '';
ALTER TABLE lawnmowing_user MODIFY COLUMN image varchar(512) CHARSET utf8 NOT NULL DEFAULT '';
ALTER TABLE snowremoval_user MODIFY COLUMN image varchar(512) CHARSET utf8 NOT NULL DEFAULT '';
ALTER TABLE fruitpicker_user MODIFY COLUMN image varchar(512) CHARSET utf8 NOT NULL DEFAULT '';
ALTER TABLE programmer_user MODIFY COLUMN image varchar(512) CHARSET utf8 NOT NULL DEFAULT '';





-- Set Back


ALTER TABLE taxi_user MODIFY COLUMN image varchar(256) CHARSET utf8 NOT NULL DEFAULT '';
ALTER TABLE transport_user MODIFY COLUMN image varchar(256) CHARSET utf8 NOT NULL DEFAULT '';
ALTER TABLE cleaner_user MODIFY COLUMN image varchar(256) CHARSET utf8 NOT NULL DEFAULT '';
ALTER TABLE windowcleaner_user MODIFY COLUMN image varchar(256) CHARSET utf8 NOT NULL DEFAULT '';
ALTER TABLE lawnmowing_user MODIFY COLUMN image varchar(256) CHARSET utf8 NOT NULL DEFAULT '';
ALTER TABLE snowremoval_user MODIFY COLUMN image varchar(256) CHARSET utf8 NOT NULL DEFAULT '';
ALTER TABLE fruitpicker_user MODIFY COLUMN image varchar(256) CHARSET utf8 NOT NULL DEFAULT '';
ALTER TABLE programmer_user MODIFY COLUMN image varchar(256) CHARSET utf8 NOT NULL DEFAULT '';


