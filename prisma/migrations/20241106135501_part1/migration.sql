-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `fristName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessionToken` (
    `toekn` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `sessionToken_toekn_key`(`toekn`),
    PRIMARY KEY (`toekn`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Movies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `movieName` VARCHAR(191) NOT NULL,
    `decription` VARCHAR(191) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `price` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reservedSeats` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessionTicket` (
    `ticket` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `movieId` INTEGER NOT NULL,
    `useTicket` BOOLEAN NOT NULL DEFAULT false,
    `selectedSeats` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `sessionTicket_ticket_key`(`ticket`),
    PRIMARY KEY (`ticket`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sessionToken` ADD CONSTRAINT `sessionToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessionTicket` ADD CONSTRAINT `sessionTicket_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessionTicket` ADD CONSTRAINT `sessionTicket_movieId_fkey` FOREIGN KEY (`movieId`) REFERENCES `Movies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
