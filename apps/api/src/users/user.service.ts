import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UserService {
  private users = [
    { id: 'user1', email: 'admin@sharanam.com', role: 'ADMIN', status: 'ACTIVE' },
    { id: 'user2', email: 'member@test.com', role: 'MEMBER', status: 'ACTIVE' },
  ];

  async findByEmail(email: string) {
    return this.users.find(u => u.email === email);
  }

  async findById(id: string) {
    const user = this.users.find(u => u.id === id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(data: any) {
    const newUser = { id: `user${Date.now()}`, ...data, status: 'ACTIVE' };
    this.users.push(newUser);
    return newUser;
  }

  async findAll() {
    return this.users;
  }
}
