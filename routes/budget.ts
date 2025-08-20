import { Router } from "express";
import { budgetsController } from "../controllers/budgets";

const router = Router();

router.get('/user/:userId', budgetsController.getBudgetsByUserId);
router.get('/:id', budgetsController.getBudgetById);
router.put('/:id', budgetsController.updateBudget);
router.post('/', budgetsController.createBudget);
router.delete('/:id', budgetsController.deleteBudget);


export { router as budgetsRouter };