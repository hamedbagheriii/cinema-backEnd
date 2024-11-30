-- DropForeignKey
ALTER TABLE `hall` DROP FOREIGN KEY `Hall_cinemaID_fkey`;

-- DropForeignKey
ALTER TABLE `images` DROP FOREIGN KEY `Images_cinemaID_fkey`;

-- DropForeignKey
ALTER TABLE `images` DROP FOREIGN KEY `Images_movieId_fkey`;

-- DropForeignKey
ALTER TABLE `moviecinema` DROP FOREIGN KEY `MovieCinema_cinemaID_fkey`;

-- DropForeignKey
ALTER TABLE `moviecinema` DROP FOREIGN KEY `MovieCinema_movieId_fkey`;

-- DropForeignKey
ALTER TABLE `sessionticket` DROP FOREIGN KEY `sessionTicket_cinemaID_fkey`;

-- DropForeignKey
ALTER TABLE `sessionticket` DROP FOREIGN KEY `sessionTicket_date_fkey`;

-- DropForeignKey
ALTER TABLE `sessionticket` DROP FOREIGN KEY `sessionTicket_email_fkey`;

-- DropForeignKey
ALTER TABLE `sessionticket` DROP FOREIGN KEY `sessionTicket_hallID_fkey`;

-- DropForeignKey
ALTER TABLE `sessionticket` DROP FOREIGN KEY `sessionTicket_movieId_fkey`;

-- DropForeignKey
ALTER TABLE `sessiontoken` DROP FOREIGN KEY `sessionToken_userId_fkey`;

-- DropForeignKey
ALTER TABLE `wallet` DROP FOREIGN KEY `Wallet_email_fkey`;

-- DropIndex
DROP INDEX `sessionTicket_Time_fkey` ON `sessionticket`;

-- CreateTable
CREATE TABLE `rolesuser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userID` VARCHAR(191) NOT NULL,
    `roleID` INTEGER NOT NULL,

    UNIQUE INDEX `rolesuser_id_key`(`id`),
    PRIMARY KEY (`userID`, `roleID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rolepermissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roleID` INTEGER NOT NULL,
    `permissionID` INTEGER NOT NULL,

    UNIQUE INDEX `rolepermissions_id_key`(`id`),
    PRIMARY KEY (`roleID`, `permissionID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roleName` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `role_roleName_key`(`roleName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `permName` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `permission_permName_key`(`permName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `wallet` ADD CONSTRAINT `wallet_email_fkey` FOREIGN KEY (`email`) REFERENCES `user`(`email`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessiontoken` ADD CONSTRAINT `sessiontoken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `moviecinema` ADD CONSTRAINT `moviecinema_cinemaID_fkey` FOREIGN KEY (`cinemaID`) REFERENCES `cinema`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `moviecinema` ADD CONSTRAINT `moviecinema_movieId_fkey` FOREIGN KEY (`movieId`) REFERENCES `movies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessionticket` ADD CONSTRAINT `sessionticket_email_fkey` FOREIGN KEY (`email`) REFERENCES `user`(`email`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessionticket` ADD CONSTRAINT `sessionticket_movieId_fkey` FOREIGN KEY (`movieId`) REFERENCES `movies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessionticket` ADD CONSTRAINT `sessionticket_cinemaID_fkey` FOREIGN KEY (`cinemaID`) REFERENCES `cinema`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessionticket` ADD CONSTRAINT `sessionticket_hallID_fkey` FOREIGN KEY (`hallID`) REFERENCES `hall`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessionticket` ADD CONSTRAINT `sessionticket_date_fkey` FOREIGN KEY (`date`) REFERENCES `date`(`date`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hall` ADD CONSTRAINT `hall_cinemaID_fkey` FOREIGN KEY (`cinemaID`) REFERENCES `cinema`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `images` ADD CONSTRAINT `images_movieId_fkey` FOREIGN KEY (`movieId`) REFERENCES `movies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `images` ADD CONSTRAINT `images_cinemaID_fkey` FOREIGN KEY (`cinemaID`) REFERENCES `cinema`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rolesuser` ADD CONSTRAINT `rolesuser_roleID_fkey` FOREIGN KEY (`roleID`) REFERENCES `role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rolesuser` ADD CONSTRAINT `rolesuser_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rolepermissions` ADD CONSTRAINT `rolepermissions_roleID_fkey` FOREIGN KEY (`roleID`) REFERENCES `role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rolepermissions` ADD CONSTRAINT `rolepermissions_permissionID_fkey` FOREIGN KEY (`permissionID`) REFERENCES `permission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RedefineIndex
CREATE UNIQUE INDEX `hall_id_key` ON `hall`(`id`);
DROP INDEX `Hall_id_key` ON `hall`;

-- RedefineIndex
CREATE UNIQUE INDEX `images_name_key` ON `images`(`name`);
DROP INDEX `Images_name_key` ON `images`;

-- RedefineIndex
CREATE UNIQUE INDEX `moviecinema_id_key` ON `moviecinema`(`id`);
DROP INDEX `MovieCinema_id_key` ON `moviecinema`;

-- RedefineIndex
CREATE UNIQUE INDEX `movies_id_key` ON `movies`(`id`);
DROP INDEX `Movies_id_key` ON `movies`;

-- RedefineIndex
CREATE UNIQUE INDEX `movies_movieName_key` ON `movies`(`movieName`);
DROP INDEX `Movies_movieName_key` ON `movies`;

-- RedefineIndex
CREATE UNIQUE INDEX `sessionticket_ticket_key` ON `sessionticket`(`ticket`);
DROP INDEX `sessionTicket_ticket_key` ON `sessionticket`;

-- RedefineIndex
CREATE UNIQUE INDEX `sessiontoken_token_key` ON `sessiontoken`(`token`);
DROP INDEX `sessionToken_token_key` ON `sessiontoken`;

-- RedefineIndex
CREATE UNIQUE INDEX `user_email_key` ON `user`(`email`);
DROP INDEX `User_email_key` ON `user`;

-- RedefineIndex
CREATE UNIQUE INDEX `wallet_email_key` ON `wallet`(`email`);
DROP INDEX `Wallet_email_key` ON `wallet`;
