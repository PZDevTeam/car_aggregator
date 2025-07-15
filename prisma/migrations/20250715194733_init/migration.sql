-- CreateTable
CREATE TABLE "car" (
    "id" SERIAL NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "speciphication" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "detailUrl" TEXT NOT NULL,
    "mileage" INTEGER NOT NULL,
    "ownersCount" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "power" TEXT NOT NULL,
    "engineCopacity" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "complectation" TEXT NOT NULL,
    "dtpCount" INTEGER NOT NULL,
    "priceRange" INTEGER[],

    CONSTRAINT "car_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "car_detailUrl_key" ON "car"("detailUrl");
