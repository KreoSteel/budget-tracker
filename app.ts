import express, { response } from "express";
import { Request, Response } from "express";
import connectDB from "./db";
import usersRouter from "./routes/users";

const app = express()
connectDB();
app.use(express.json());

app.use("/users", usersRouter);


app.listen(3000, () => {
    console.log("Server is running on port 3000");
});