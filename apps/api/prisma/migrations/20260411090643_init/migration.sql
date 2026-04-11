-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "nomineeDob" TIMESTAMP(3),
ADD COLUMN     "nomineeName" TEXT,
ADD COLUMN     "nomineeRelation" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "groupId" TEXT;
