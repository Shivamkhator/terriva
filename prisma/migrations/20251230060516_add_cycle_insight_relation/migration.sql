-- CreateTable
CREATE TABLE "CycleInsight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "avgCycleLength" INTEGER,
    "avgPeriodLength" INTEGER,
    "nextPeriodDate" TIMESTAMP(3),
    "totalPeriods" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CycleInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CycleInsight_userId_key" ON "CycleInsight"("userId");

-- AddForeignKey
ALTER TABLE "CycleInsight" ADD CONSTRAINT "CycleInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
