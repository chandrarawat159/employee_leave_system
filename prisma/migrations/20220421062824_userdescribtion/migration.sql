/*
  Warnings:

  - Added the required column `confirmPasword` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `confirmPasword` VARCHAR(255) NOT NULL,
    MODIFY `password` VARCHAR(255) NOT NULL;
