import express, { response } from "express";
import { Request, Response } from "express";
import cors from "cors";
import connectDB from "./db";
import authRouter from "./routes/auth";
import accountsRouter from "./routes/account";
import usersRouter from "./routes/users";
import categoriesRouter from "./routes/category";
import { budgetsRouter } from "./routes/budget";
import transactionsRouter from "./routes/transactions";
import goalsRouter from "./routes/goals";

const app = express()
connectDB();
app.use(express.json());

// Configure CORS to allow frontend - very permissive for development
app.use(cors({
  origin: '*', // Allow all origins
  credentials: false, // Disable credentials for wildcard origin
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/accounts", accountsRouter);
app.use("/categories", categoriesRouter);
app.use("/transactions", transactionsRouter);
app.use("/budgets", budgetsRouter);
app.use("/goals", goalsRouter);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});