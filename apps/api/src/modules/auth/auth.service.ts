import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { RegisterBody, LoginBody, JwtPayload } from '../../types/auth.types';
import { ValidationException } from '../../shared/exceptions';

const authRepo = new AuthRepository();

// The secret key used to sign JWTs — like a wax seal only you have
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_change_this';
const JWT_EXPIRES_IN = '7d'; // Token lasts 7 days

export class AuthService {
  async register(body: RegisterBody) {
    // 1. Check if email already exists
    const existing = await authRepo.findByEmail(body.email);
    if (existing) {
      throw new ValidationException('Email already in use');
    }

    // 2. Hash the password — NEVER store plain text passwords
    // bcrypt scrambles it so even if the DB leaks, passwords are safe
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // 3. Save the user
    const user = await authRepo.createUser({
      name: body.name,
      email: body.email,
      password: hashedPassword,
    });

    // 4. Create a JWT token (the "wristband")
    const token = this.signToken({ userId: user.id, email: user.email });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  async login(body: LoginBody) {
    // 1. Find the user by email
    const user = await authRepo.findByEmail(body.email);
    if (!user) {
      throw new ValidationException('Invalid email or password');
    }

    // 2. Compare the plain password with the stored hash
    const isMatch = await bcrypt.compare(body.password, user.password);
    if (!isMatch) {
      throw new ValidationException('Invalid email or password');
    }

    // 3. Issue a token
    const token = this.signToken({ userId: user.id, email: user.email });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  private signToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }
}