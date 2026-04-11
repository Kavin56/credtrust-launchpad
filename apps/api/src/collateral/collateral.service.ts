import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateCollateralDto } from './dto/create-collateral.dto'
import { UpdateCollateralDto } from './dto/update-collateral.dto'
import { LedgerService } from '../ledger/ledger.service'
import { Decimal } from '@prisma/client/runtime/library'

@Injectable()
export class CollateralService {
  constructor(private prisma: PrismaService, private ledger: LedgerService) {}

  async createCollateral(loanId: string, dto: CreateCollateralDto, actorId?: string) {
    // Verify loan exists
    const loan = await (this.prisma as any).loan.findUnique({ where: { id: loanId } })
    if (!loan) {
      throw new NotFoundException('Loan not found')
    }
    const collateral = await (this.prisma as any).collateral.create({
      data: {
        loanId,
        type: dto.type,
        description: dto.description,
        value: dto.value,
        status: dto.status ?? 'ATTACHED',
        fileUrl: dto.fileUrl,
      },
    })
    // Placeholder for ledger integration hook (if ledger service exists in future)
    await this.ledger.recordJournal(
      'COLLATERAL_PLEDGE',
      collateral.id,
      [
        { accountId: 'COLLATERAL_ASSET', type: 'DR', amount: Number(dto.value) },
        { accountId: 'COLLATERAL_PLEDGED_LIABILITY', type: 'CR', amount: Number(dto.value) },
      ],
      `Collateral pledge for loan ${loanId}: ${dto.type}`,
      actorId,
    )

    // Audit log for collateral creation
    try {
      await (this.prisma as any).auditLog.create({
        data: {
          action: 'CREATE',
          actorId: actorId,
          entity: 'Collateral',
          entityId: collateral.id,
          diff: null,
        },
      })
    } catch {
      // ignore audit log failures to avoid blocking collateral creation
    }
    return collateral
  }

  async getCollateralForLoan(loanId: string) {
    return (this.prisma as any).collateral.findMany({ where: { loanId } })
  }

  async getCollateralById(id: string) {
    const c = await (this.prisma as any).collateral.findUnique({ where: { id } })
    if (!c) throw new NotFoundException('Collateral not found')
    return c
  }

  async updateCollateral(id: string, dto: UpdateCollateralDto, actorId?: string) {
    const oldCollateral = await (this.prisma as any).collateral.findUnique({ where: { id } })
    if (!oldCollateral) {
      throw new NotFoundException('Collateral not found')
    }

    const updatedCollateral = await (this.prisma as any).collateral.update({
      where: { id },
      data: {
        ...(dto.type && { type: dto.type }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.value !== undefined && { value: dto.value }),
        ...(dto.status && { status: dto.status }),
        ...(dto.fileUrl && { fileUrl: dto.fileUrl }),
        updatedAt: new Date(),
      },
    })

    // Audit log for collateral update
    try {
      await (this.prisma as any).auditLog.create({
        data: {
          action: 'UPDATE',
          actorId: actorId,
          entity: 'Collateral',
          entityId: updatedCollateral.id,
          diff: { old: oldCollateral, new: updatedCollateral },
        },
      })
    } catch {
      // ignore audit log failures
    }
    return updatedCollateral
  }
}
