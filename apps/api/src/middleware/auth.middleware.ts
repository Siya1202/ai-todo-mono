import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_change_this';

// Extend Express's Request type so we can attach the user to it
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Look for the token in the Authorization header
  // The header looks like: "Bearer eyJhbGci..."
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'No token provided' });
  }

  // Pull out just the token part (after "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token is real and not expired
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded; // Attach user info to the request
    next(); // Pass control to the next handler
  } catch {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
  }
}