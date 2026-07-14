import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    uid: string;
    email: string;
    displayName: string | null;
    role: string; // 'Admin', 'Supervisor', 'Worker'
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email || '';
    const displayName = decodedToken.name || null;

    // Check if user exists in database, or create them
    let dbUser = await db.select().from(users).where(eq(users.uid, uid)).then(r => r[0]);

    if (!dbUser) {
      // Determine default role. Let's make user email 'abhijeet.surya1@gmail.com' or the first user an Admin!
      let role = 'Worker';
      const existingUsers = await db.select().from(users).limit(1);
      if (existingUsers.length === 0 || email.toLowerCase() === 'abhijeet.surya1@gmail.com') {
        role = 'Admin';
      }

      const inserted = await db.insert(users)
        .values({
          uid,
          email,
          displayName,
          role,
        })
        .returning();
      dbUser = inserted[0];
    }

    req.user = {
      id: dbUser.id,
      uid: dbUser.uid,
      email: dbUser.email,
      displayName: dbUser.displayName,
      role: dbUser.role,
    };
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: Requires one of [${allowedRoles.join(', ')}] roles` });
    }
    next();
  };
};
