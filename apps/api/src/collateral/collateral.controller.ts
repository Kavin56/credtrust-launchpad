import { Controller, Get, Post, Put, Param, Body, UseGuards, Req } from '@nestjs/common'
import { CollateralService } from './collateral.service'
import { CreateCollateralDto } from './dto/create-collateral.dto'
import { UpdateCollateralDto } from './dto/update-collateral.dto'
import { JwtAuthGuard } from '../auth/jwt.guard'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

@ApiTags('collateral')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loans/:loanId/collateral')
export class CollateralController {
  constructor(private readonly collateralService: CollateralService) {}

  @Post()
  create(@Param('loanId') loanId: string, @Body() dto: CreateCollateralDto, @Req() req: any) {
    return this.collateralService.createCollateral(loanId, dto, req.user.userId)
  }

  @Get()
  findAll(@Param('loanId') loanId: string) {
    return this.collateralService.getCollateralForLoan(loanId)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collateralService.getCollateralById(id)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCollateralDto, @Req() req: any) {
    return this.collateralService.updateCollateral(id, dto, req.user.userId)
  }
}
