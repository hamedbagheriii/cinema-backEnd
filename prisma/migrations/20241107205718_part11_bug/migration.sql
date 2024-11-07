-- DropForeignKey
ALTER TABLE `sessionticket` DROP FOREIGN KEY `sessionTicket_userId_fkey`;

-- AddForeignKey
ALTER TABLE `sessionTicket` ADD CONSTRAINT `sessionTicket_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`email`) ON DELETE RESTRICT ON UPDATE CASCADE;
