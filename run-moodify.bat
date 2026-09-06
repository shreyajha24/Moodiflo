@echo off
if "%DB_URL%"=="" set "DB_URL=jdbc:mysql://localhost:3306/moodify?createDatabaseIfNotExist=true&serverTimezone=UTC"
if "%DB_USERNAME%"=="" set "DB_USERNAME=root"
if "%DB_PASSWORD%"=="" set /p "DB_PASSWORD=Enter Database Password: "
if "%JWT_SECRET%"=="" set /p "JWT_SECRET=Enter JWT Secret (min 256 bits): "
java -jar target\Moodify-0.0.1-SNAPSHOT.jar
