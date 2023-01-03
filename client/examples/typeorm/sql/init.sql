-- create a role to work with, (this script should be included and executed by the default superuser : postgres
-- ? which should come first ? the db or role ?
CREATE ROLE "default" WITH SUPERUSER ;
-- ? is the above enough to connect ? how can we revert the above command ?
-- -> using drop
-- DROP ROLE "default" ;
-- after trying the above command, it does not allow login ?
-- we can drop it and create a new one, or use alter
ALTER ROLE "default" WITH LOGIN ;
-- we still canno't login using this user ; for now let's rename it to the unix user 
ALTER ROLE "default" RENAME TO "ubuntu" ;
-- it works ! our user might have some required roles missing such as Create DB, we can fix em later
