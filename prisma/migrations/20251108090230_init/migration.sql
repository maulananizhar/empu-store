-- DropForeignKey
ALTER TABLE `Discounts` DROP FOREIGN KEY `Discounts_productId_fkey`;

-- DropIndex
DROP INDEX `Discounts_productId_key` ON `Discounts`;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_categoryId_fkey_new` FOREIGN KEY (`categoryId`) REFERENCES `Categories`(`categoryId`) ON DELETE RESTRICT ON UPDATE CASCADE;
