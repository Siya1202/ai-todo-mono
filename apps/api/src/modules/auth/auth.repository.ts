import prisma from '../../config/database';

export class AuthRepository {
  // Find a user by their email address
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  // Create a brand new user row in the database
  async createUser(data: { name: string; email: string; password: string }) {
    return prisma.user.create({ data });
  }

  // Find a user by their ID (used to verify JWT)
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }
}