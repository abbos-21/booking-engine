/*
  Warnings:

  - Added the required column `roomDescription` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomName` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomPrice` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Room" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "roomNumber" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "roomDescription" TEXT NOT NULL,
    "roomPrice" REAL NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "nextAvailableDateTime" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Room" ("createdAt", "id", "isAvailable", "nextAvailableDateTime", "roomNumber") SELECT "createdAt", "id", "isAvailable", "nextAvailableDateTime", "roomNumber" FROM "Room";
DROP TABLE "Room";
ALTER TABLE "new_Room" RENAME TO "Room";
CREATE UNIQUE INDEX "Room_roomNumber_key" ON "Room"("roomNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
