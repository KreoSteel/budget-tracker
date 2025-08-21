import { Router } from "express";
import { goalsControllers } from "../controllers/goal";

const router = Router();

router.get('/', goalsControllers.getAllGoals);
router.get('/:id', goalsControllers.getGoalById);
router.post('/', goalsControllers.createGoal);
router.put('/:id', goalsControllers.updateGoal);
router.delete('/:id', goalsControllers.deleteGoal);

export default router;