import { Router } from "express";
import { transactionsControllers } from "../controllers/transactions";

const router = Router();

router.get("/", transactionsControllers.getAllTransactions);
router.get("/:id", transactionsControllers.getTransactionById);
router.post("/", transactionsControllers.createTransaction);
router.put("/:id", transactionsControllers.updateTransaction);

export default router;