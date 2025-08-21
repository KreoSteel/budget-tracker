import { categoriesControllers } from "../controllers/categories";
import { Router } from "express";

const router = Router();

// GET all categories for a user
router.get("/", categoriesControllers.getAllCategories);

// GET categories by user ID
router.get("/user/:userId", categoriesControllers.getCategoryByUserId);

// GET category spending by category ID and user ID
router.get("/:categoryId/spending/:userId", categoriesControllers.getCategorySpending);

// GET category income by category ID and user ID
router.get("/:categoryId/income/:userId", categoriesControllers.getCategoryIncome);

// GET a specific category by ID
router.get("/:id", categoriesControllers.getCategoryById);

// POST create a new category
router.post("/", categoriesControllers.createCategory);

// PUT update an existing category
router.put("/:id", categoriesControllers.updateCategory);

// DELETE a category
router.delete("/:id", categoriesControllers.deleteCategory);

export default router;