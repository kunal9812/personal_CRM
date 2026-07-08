import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth";
import { contactsRouter } from "./routes/contacts";
import { interactionsRouter } from "./routes/interactions";
import { dashboardRouter } from "./routes/dashboard";
import { requireAuth } from "./middlewares/auth";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/contacts", requireAuth, contactsRouter);
app.use("/api/contacts/:contactId/interactions", requireAuth, interactionsRouter);
app.use("/api/dashboard", requireAuth, dashboardRouter);

// Test protected route
app.get("/api/me", requireAuth, (req, res) => {
  res.json({ userId: req.userId });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
