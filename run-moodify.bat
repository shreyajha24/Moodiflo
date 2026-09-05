@echo off
set "DB_URL=jdbc:mysql://localhost:3306/moodify?createDatabaseIfNotExist=true&serverTimezone=UTC"
set "DB_USERNAME=root"
set "DB_PASSWORD=Shreya@24"
set "JWT_SECRET=moodify-super-secret-jwt-key-for-development-must-be-at-least-256-bits-long!"
java -jar target\Moodify-0.0.1-SNAPSHOT.jar
