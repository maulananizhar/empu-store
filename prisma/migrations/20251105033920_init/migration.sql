/*
  Warnings:

  - You are about to alter the column `name` on the `Roles` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `username` on the `Users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `email` on the `Users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.

*/
-- DropIndex
DROP INDEX `Roles_name_key` ON `Roles`;

-- AlterTable
ALTER TABLE `Roles` MODIFY `name` VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `Users` MODIFY `username` VARCHAR(50) NOT NULL,
    MODIFY `email` VARCHAR(100) NOT NULL,
    MODIFY `password` TEXT NOT NULL;
