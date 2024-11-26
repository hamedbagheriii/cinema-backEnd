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
ALTER TABLE `wallet` DROP FOREIGN KEY `Wallet_email_fkey`;

-- DropIndex
DROP INDEX `sessionTicket_Time_fkey` ON `sessionticket`;

-- AddForeignKey
ALTER TABLE `wallet` ADD CONSTRAINT `wallet_email_fkey` FOREIGN KEY (`email`) REFERENCES `user`(`email`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movieCinema` ADD CONSTRAINT `movieCinema_cinemaID_fkey` FOREIGN KEY (`cinemaID`) REFERENCES `cinema`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movieCinema` ADD CONSTRAINT `movieCinema_movieId_fkey` FOREIGN KEY (`movieId`) REFERENCES `movies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hall` ADD CONSTRAINT `hall_cinemaID_fkey` FOREIGN KEY (`cinemaID`) REFERENCES `cinema`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `images` ADD CONSTRAINT `images_movieId_fkey` FOREIGN KEY (`movieId`) REFERENCES `movies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `images` ADD CONSTRAINT `images_cinemaID_fkey` FOREIGN KEY (`cinemaID`) REFERENCES `cinema`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RedefineIndex
CREATE UNIQUE INDEX `hall_id_key` ON `hall`(`id`);
DROP INDEX `Hall_id_key` ON `hall`;

-- RedefineIndex
CREATE UNIQUE INDEX `images_name_key` ON `images`(`name`);
DROP INDEX `Images_name_key` ON `images`;

-- RedefineIndex
CREATE UNIQUE INDEX `movieCinema_id_key` ON `movieCinema`(`id`);
DROP INDEX `MovieCinema_id_key` ON `moviecinema`;

-- RedefineIndex
CREATE UNIQUE INDEX `movies_id_key` ON `movies`(`id`);
DROP INDEX `Movies_id_key` ON `movies`;

-- RedefineIndex
CREATE UNIQUE INDEX `movies_movieName_key` ON `movies`(`movieName`);
DROP INDEX `Movies_movieName_key` ON `movies`;

-- RedefineIndex
CREATE UNIQUE INDEX `user_email_key` ON `user`(`email`);
DROP INDEX `User_email_key` ON `user`;

-- RedefineIndex
CREATE UNIQUE INDEX `wallet_email_key` ON `wallet`(`email`);
DROP INDEX `Wallet_email_key` ON `wallet`;
