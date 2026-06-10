
CREATE DATABASE assignments_db;


CREATE USER assignments_user WITH PASSWORD 'password123';


GRANT ALL PRIVILEGES ON DATABASE assignments_db TO assignments_user;
GRANT ALL ON SCHEMA public TO assignments_user;


\c assignments_db;


GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO assignments_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO assignments_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO assignments_user;