-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tel" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hobbies" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "User_tel_key" ON "User"("tel");
