import { Router } from "express";
import { transactionsControllers } from "../controllers/transactions";

const router = Router();

router.get("/", transactionsControllers.getAllTransactions);
router.get("/:id", transactionsControllers.getTransactionById);
router.get("/date-range/:startDate/:endDate/:userId", transactionsControllers.getTransactionsByDateRange);
router.get("/category/:categoryId/:period/:userId", transactionsControllers.getTransactionsByCategory);
router.get("/account/:accountId/:period/:userId", transactionsControllers.getTransactionsByAccount);
router.post("/", transactionsControllers.createTransaction);
router.put("/:id", transactionsControllers.updateTransaction);
router.delete("/:id", transactionsControllers.deleteTransaction);

export default router;