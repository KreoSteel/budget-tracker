import { Router } from "express";
import { budgetsController } from "../controllers/budgets";

const router = Router();

router.get('/user/:userId', budgetsController.getBudgetsByUserId);
router.get('/:id', budgetsController.getBudgetById);
router.get('/:id/progress', budgetsController.getBudgetProgress);
router.get('/:budgetId/alerts', budgetsController.getBudgetAlerts);
router.put('/:id', budgetsController.updateBudget);
router.post('/', budgetsController.createBudget);
router.delete('/:id', budgetsController.deleteBudget);
router.post('/:budgetId/recalculate', budgetsController.recalculateBudgetProgress);
router.post('/test-update', budgetsController.testBudgetUpdate);

export { router as budgetsRouter };