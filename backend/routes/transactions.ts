import { Router } from "express";
import { transactionsControllers } from "../controllers/transactions";
import { paginationMiddleware } from "../middleware/pagination";

const router = Router();

// Apply pagination middleware with custom options for transactions
const transactionPagination = paginationMiddleware({
    defaultLimit: 5,
    maxLimit: 9999,
    validSortFields: ['date', 'amount', 'description', 'createdAt', 'updatedAt'],
    defaultSort: 'date',
    defaultOrder: 'desc'
});

router.get("/", transactionPagination, transactionsControllers.getAllTransactions);
router.get("/recent/:userId", transactionsControllers.getRecentTransactions);
router.get("/user/:userId", transactionsControllers.getTransactionsByUserId);
router.get("/:id", transactionsControllers.getTransactionById);
router.get("/date-range/:startDate/:endDate/:userId", transactionsControllers.getTransactionsByDateRange);
router.get("/category/:categoryId/:period/:userId", transactionsControllers.getTransactionsByCategory);
router.get("/account/:accountId/:period/:userId", transactionsControllers.getTransactionsByAccount);
router.get("/financial-metrics/:userId", transactionsControllers.getFinancialMetrics);
router.post("/", transactionsControllers.createTransaction);
router.put("/:id", transactionsControllers.updateTransaction);
router.delete("/:id", transactionsControllers.deleteTransaction);

export default router;