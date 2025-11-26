/*
  Warnings:

  - Added the required column `icon` to the `Categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Categories` ADD COLUMN `icon` VARCHAR(100) NOT NULL;
