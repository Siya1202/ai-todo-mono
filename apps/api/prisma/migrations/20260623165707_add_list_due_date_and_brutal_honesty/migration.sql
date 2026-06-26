-- AlterTable
ALTER TABLE "TodoList" ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "isAchievable" BOOLEAN,
ADD COLUMN     "reasoning" TEXT,
ADD COLUMN     "verdict" TEXT;
