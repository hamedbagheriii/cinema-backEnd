/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Wallet` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Wallet_email_key` ON `Wallet`(`email`);
