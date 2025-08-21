import { accountsControllers } from "../controllers/accounts";
import { Router } from "express";

const router = Router();

router.get("/", accountsControllers.getAllAccounts);
router.get("/type/:type", accountsControllers.getAccountsByType);
router.get("/user/:userId", accountsControllers.getAccountsByUserId);
router.get("/user/:userId/history", accountsControllers.getAccountBalanceHistory);
router.get("/user/:userId/networth", accountsControllers.totalNetWorth);
router.get("/:id", accountsControllers.getAccountById);
router.post("/", accountsControllers.createAccount);
router.patch("/transfer", accountsControllers.transferBetweenAccounts);
router.patch("/:id/activate", accountsControllers.activateAccount);
router.patch("/:id/deactivate", accountsControllers.deactivateAccount);
router.delete("/:id", accountsControllers.deleteAccount);


export default router;
