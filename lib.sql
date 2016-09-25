-- Using ';;' as Delimiter so that one can copy-paste it into for example phpMyAdmin (Remember to set the delimiter to ';;')
-- When the file is included in for example a php-script (and run using PDO) then one has to replace the ';;' to ';' (using for example $sql=preg_replace('/;;/',';',$sql); )

DROP PROCEDURE IF EXISTS copyTable;;
CREATE PROCEDURE copyTable(INameN varchar(128),IName varchar(128))
  BEGIN
    SET @q=CONCAT('DROP TABLE IF EXISTS ', INameN,';');     PREPARE stmt1 FROM @q;  EXECUTE stmt1;  DEALLOCATE PREPARE stmt1; 
    SET @q=CONCAT('CREATE TABLE ',INameN,' LIKE ',IName,';');   PREPARE stmt1 FROM @q;  EXECUTE stmt1; DEALLOCATE PREPARE stmt1; 
    SET @q=CONCAT('INSERT INTO ',INameN, ' SELECT * FROM ',IName,';');    PREPARE stmt1 FROM @q;  EXECUTE stmt1;  DEALLOCATE PREPARE stmt1; 
  END;;





