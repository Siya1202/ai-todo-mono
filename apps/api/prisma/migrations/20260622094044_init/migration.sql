-- CreateTable
CREATE TABLE "TodoList" (
    "id" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TodoList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TodoItem" (
    "id" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "listId" TEXT NOT NULL,

    CONSTRAINT "TodoItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TodoItem" ADD CONSTRAINT "TodoItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "TodoList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
