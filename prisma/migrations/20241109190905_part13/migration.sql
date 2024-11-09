/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Movies` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE `cinema` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cinemaName` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,
    `movieID` INTEGER NOT NULL,

    UNIQUE INDEX `cinema_id_key`(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Hall` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hallName` VARCHAR(191) NOT NULL,
    `maximumRows` INTEGER NOT NULL,
    `cinemaID` INTEGER NOT NULL,

    UNIQUE INDEX `Hall_id_key`(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `date` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `hallID` INTEGER NOT NULL,

    UNIQUE INDEX `date_date_key`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Movies_id_key` ON `Movies`(`id`);

-- AddForeignKey
ALTER TABLE `cinema` ADD CONSTRAINT `cinema_movieID_fkey` FOREIGN KEY (`movieID`) REFERENCES `Movies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Hall` ADD CONSTRAINT `Hall_cinemaID_fkey` FOREIGN KEY (`cinemaID`) REFERENCES `cinema`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `date` ADD CONSTRAINT `date_hallID_fkey` FOREIGN KEY (`hallID`) REFERENCES `Hall`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
