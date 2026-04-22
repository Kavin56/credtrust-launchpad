import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class MembersService {
  private mockMembers = [
    { 
      id: 'mem1', 
      fullName: 'Suresh Kumar', 
      memberId: 'MEM0001', 
      userId: 'user1',
      status: 'ACTIVE',
      kycStatus: 'VERIFIED',
      joinedAt: new Date(),
      depositAccounts: [],
      loans: [],
      shareAccounts: []
    },
    { 
      id: 'mem2', 
      fullName: 'Priya Murugan', 
      memberId: 'MEM0002', 
      userId: 'user2',
      status: 'ACTIVE',
      kycStatus: 'PENDING'
    }
  ];

  async findAll(query: any) {
    return { items: this.mockMembers, total: this.mockMembers.length, page: 1, limit: 10 };
  }

  async getProfile(userId: string) {
    const member = this.mockMembers.find(m => m.userId === userId || m.id === userId) || this.mockMembers[0];
    return member;
  }

  async dashboardOverview(userId: string) {
    const member = await this.getProfile(userId);
    return {
      name: member.fullName,
      kycStatus: member.kycStatus,
      totalSavings: 25000,
      activeLoansCount: 1,
      sharesOwned: 100,
    };
  }

  async getStats() {
    return { total: 8200, active: 8150, pendingKyc: 12 };
  }
  
  async updateKyc(memberId: string, dto: any) {
    return { success: true };
  }

  async uploadPhoto(userId: string, file: any) {
    return { photoUrl: 'https://via.placeholder.com/150' };
  }
  
  async deactivate(id: string, reason: string) {
    return { success: true };
  }
}
