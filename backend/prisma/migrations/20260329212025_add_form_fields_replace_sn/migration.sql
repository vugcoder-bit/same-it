/*
  Warnings:

  - You are about to drop the column `requiresSN` on the `service` table. All the data in the column will be lost.
  - You are about to drop the `order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `compatibility` DROP FOREIGN KEY `Compatibility_deviceModelId_fkey`;

-- DropForeignKey
ALTER TABLE `compatibility` DROP FOREIGN KEY `Compatibility_subCategoryId_fkey`;

-- DropForeignKey
ALTER TABLE `device` DROP FOREIGN KEY `Device_deviceTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `devicemodel` DROP FOREIGN KEY `DeviceModel_deviceId_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_paymentMethodId_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_userId_fkey`;

-- DropForeignKey
ALTER TABLE `schematic` DROP FOREIGN KEY `Schematic_deviceModelId_fkey`;

-- DropForeignKey
ALTER TABLE `service` DROP FOREIGN KEY `Service_categoryId_fkey`;

-- AlterTable
ALTER TABLE `appsettings` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `compatibility` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `componentsubcategory` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `device` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `devicemodel` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `devicetype` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `errorlog` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `paymentmethod` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `schematic` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `service` DROP COLUMN `requiresSN`,
    ADD COLUMN `formFields` JSON NULL,
    ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `servicecategory` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- DropTable
DROP TABLE `order`;

-- DropTable
DROP TABLE `user`;

-- CreateTable
CREATE TABLE `orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `paymentMethodId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `totalPrice` DOUBLE NOT NULL DEFAULT 0,
    `phone1` VARCHAR(191) NOT NULL,
    `phone2` VARCHAR(191) NULL,
    `telegramUsername` VARCHAR(191) NULL,
    `formResponses` JSON NULL,
    `paymentScreenshot` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `status` ENUM('PROCESSING', 'FAILED', 'SUCCESSFUL') NOT NULL DEFAULT 'PROCESSING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `adminFileUrl` VARCHAR(191) NULL,
    `adminNotes` TEXT NULL,

    INDEX `orders_paymentMethodId_idx`(`paymentMethodId`),
    INDEX `orders_serviceId_idx`(`serviceId`),
    INDEX `orders_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    `subscriptionExpireDate` DATETIME(3) NULL,
    `deviceId` VARCHAR(191) NULL,
    `pushToken` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `compatibility` ADD CONSTRAINT `compatibility_deviceModelId_fkey` FOREIGN KEY (`deviceModelId`) REFERENCES `devicemodel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compatibility` ADD CONSTRAINT `compatibility_subCategoryId_fkey` FOREIGN KEY (`subCategoryId`) REFERENCES `componentsubcategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device` ADD CONSTRAINT `device_deviceTypeId_fkey` FOREIGN KEY (`deviceTypeId`) REFERENCES `devicetype`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `devicemodel` ADD CONSTRAINT `devicemodel_deviceId_fkey` FOREIGN KEY (`deviceId`) REFERENCES `device`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_paymentMethodId_fkey` FOREIGN KEY (`paymentMethodId`) REFERENCES `paymentmethod`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schematic` ADD CONSTRAINT `schematic_deviceModelId_fkey` FOREIGN KEY (`deviceModelId`) REFERENCES `devicemodel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service` ADD CONSTRAINT `service_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `servicecategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `compatibility` RENAME INDEX `Compatibility_deviceModelId_fkey` TO `compatibility_deviceModelId_idx`;

-- RenameIndex
ALTER TABLE `compatibility` RENAME INDEX `Compatibility_subCategoryId_fkey` TO `compatibility_subCategoryId_idx`;

-- RenameIndex
ALTER TABLE `componentsubcategory` RENAME INDEX `ComponentSubCategory_componentType_name_key` TO `componentsubcategory_componentType_name_key`;

-- RenameIndex
ALTER TABLE `device` RENAME INDEX `Device_deviceTypeId_fkey` TO `device_deviceTypeId_idx`;

-- RenameIndex
ALTER TABLE `device` RENAME INDEX `Device_name_key` TO `device_name_key`;

-- RenameIndex
ALTER TABLE `devicemodel` RENAME INDEX `DeviceModel_deviceId_name_key` TO `devicemodel_deviceId_name_key`;

-- RenameIndex
ALTER TABLE `devicetype` RENAME INDEX `DeviceType_name_key` TO `devicetype_name_key`;

-- RenameIndex
ALTER TABLE `schematic` RENAME INDEX `Schematic_deviceModelId_fkey` TO `schematic_deviceModelId_idx`;

-- RenameIndex
ALTER TABLE `service` RENAME INDEX `Service_categoryId_fkey` TO `service_categoryId_idx`;
