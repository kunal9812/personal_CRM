import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserLoginSchema, UserRegisterSchema } from "@crm/shared";
import { db, users, refreshTokens } from "@crm/db";
import { eq } from "drizzle-orm";

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-dev";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "super-secret-refresh-key";

function generateAccessToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "15m" });
}

function generateRefreshToken(userId: string) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
}

authRouter.post("/signup", async (req, res) => {
  try {
    const data = UserRegisterSchema.parse(req.body);
    const existing = await db.select().from(users).where(eq(users.email, data.email));
    
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    
    const [newUser] = await db.insert(users).values({
      email: data.email,
      passwordHash,
    }).returning();

    return res.status(201).json({ message: "User created successfully", userId: newUser.id });
  } catch (error: any) {
    console.error("Signup error:", error);
    return res.status(400).json({ error: error.message || "Invalid input" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const data = UserLoginSchema.parse(req.body);
    const [user] = await db.select().from(users).where(eq(users.email, data.email));

    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user.id);
    const { rawToken, tokenHash } = generateRefreshToken(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    res.cookie("refreshToken", rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "Invalid input" });
  }
});

authRouter.post("/refresh", async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ error: "No refresh token provided" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const [storedToken] = await db.select().from(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));

    if (!storedToken) {
      // Possible reuse/theft detected? Or just logged out.
      // Ideally, if it was decoded we'd know the userId to delete all tokens. But since it's just a raw random string, we can't easily map back without it being in DB.
      // If we used a JWT for refresh tokens, we could extract the userId. For now, just reject.
      res.clearCookie("refreshToken", { path: "/api/auth" });
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    if (new Date() > storedToken.expiresAt) {
      await db.delete(refreshTokens).where(eq(refreshTokens.id, storedToken.id));
      res.clearCookie("refreshToken", { path: "/api/auth" });
      return res.status(401).json({ error: "Refresh token expired" });
    }

    const { rawToken: newRaw, tokenHash: newHash } = generateRefreshToken(storedToken.userId);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Delete old, insert new (RTR)
    await db.transaction(async (tx) => {
      await tx.delete(refreshTokens).where(eq(refreshTokens.id, storedToken.id));
      await tx.insert(refreshTokens).values({
        userId: storedToken.userId,
        tokenHash: newHash,
        expiresAt,
      });
    });

    const accessToken = generateAccessToken(storedToken.userId);

    res.cookie("refreshToken", newRaw, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

authRouter.post("/logout", async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    await db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));
  }
  res.clearCookie("refreshToken", { path: "/api/auth" });
  return res.json({ message: "Logged out" });
});
