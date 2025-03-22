import express, { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.get("/login", (req: Request, res: Response) => {
  res.sendFile(__dirname + '/public/login.html');
});
app.get("/register", (req: Request, res: Response) => {
    res.sendFile(__dirname + '/public/registration.html');
  });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
