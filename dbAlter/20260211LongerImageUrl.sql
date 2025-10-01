
-- developement
ALTER TABLE id192_user MODIFY COLUMN image varchar(1024) CHARSET utf8 NOT NULL DEFAULT '';
ALTER TABLE idL750_user MODIFY COLUMN image varchar(1024) CHARSET utf8 NOT NULL DEFAULT '';
ALTER TABLE idLoc_user MODIFY COLUMN image varchar(1024) CHARSET utf8 NOT NULL DEFAULT '';

-- production
ALTER TABLE id_user MODIFY COLUMN image varchar(1024) CHARSET utf8 NOT NULL DEFAULT '';


-- Set Back

-- developement
ALTER TABLE id192_user MODIFY COLUMN image varchar(512) CHARSET utf8 NOT NULL DEFAULT '';
ALTER TABLE idL750_user MODIFY COLUMN image varchar(512) CHARSET utf8 NOT NULL DEFAULT '';
ALTER TABLE idLoc_user MODIFY COLUMN image varchar(512) CHARSET utf8 NOT NULL DEFAULT '';

-- production
ALTER TABLE id_user MODIFY COLUMN image varchar(512) CHARSET utf8 NOT NULL DEFAULT '';

