-- CreateTable
CREATE TABLE `user` (
    `userId` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(55) NOT NULL,
    `email` VARCHAR(55) NOT NULL,
    `password` VARCHAR(55) NOT NULL,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
