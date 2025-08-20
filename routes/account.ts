import { accountsControllers } from "../controllers/accounts";
import { Router } from "express";

const router = Router();

router.get("/", accountsControllers.getAllAccounts);
router.get("/type/:type", accountsControllers.getAccountsByType);
router.get("/:id", accountsControllers.getAccountById);
router.post("/", accountsControllers.createAccount);
router.patch("/:id/activate", accountsControllers.activateAccount);
router.patch("/:id/deactivate", accountsControllers.deactivateAccount);
router.delete("/:id", accountsControllers.deleteAccount);


export default router;
