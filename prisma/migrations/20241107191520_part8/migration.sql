/*
  Warnings:

  - A unique constraint covering the columns `[movieName]` on the table `Movies` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Movies_movieName_key` ON `Movies`(`movieName`);
