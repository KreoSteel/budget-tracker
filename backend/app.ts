import express, { response } from "express";
import { Request, Response } from "express";
import connectDB from "./db";
import accountsRouter from "./routes/account";
import usersRouter from "./routes/users";
import categoriesRouter from "./routes/category";
import { budgetsRouter } from "./routes/budget";
import transactionsRouter from "./routes/transactions";
import goalsRouter from "./routes/goals";

const app = express()
connectDB();
app.use(express.json());

app.use("/users", usersRouter);
app.use("/accounts", accountsRouter);
app.use("/categories", categoriesRouter);
app.use("/transactions", transactionsRouter);
app.use("/budgets", budgetsRouter);
app.use("/goals", goalsRouter);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});