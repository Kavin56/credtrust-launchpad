import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  Req, 
  UseGuards, 
  ForbiddenException 
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { OfficeExpensesService } from './office-expenses.service';

@ApiTags('office-expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('office-expenses')
export class OfficeExpensesController {
  constructor(private readonly service: OfficeExpensesService) {}

  @Get('summary')
  @Roles('ADMIN')
  getSummary() {
    return this.service.getSummary();
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: any, @Req() req: any) {
    const adminUser = req.user;
    if (adminUser.role !== 'ADMIN' && adminUser.role !== 'CEO') {
      throw new ForbiddenException('Only admin users can perform this action');
    }
    return this.service.create(dto, adminUser);
  }

  @Get()
  @Roles('ADMIN')
  findAll(
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.service.findAll({ type, startDate, endDate });
  }

  @Put(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    const adminUser = req.user;
    if (adminUser.role !== 'ADMIN' && adminUser.role !== 'CEO') {
      throw new ForbiddenException('Only admin users can perform this action');
    }
    return this.service.update(id, dto, adminUser);
  }

  @Delete(':id')
  @Roles('ADMIN')
  delete(@Param('id') id: string, @Req() req: any) {
    const adminUser = req.user;
    if (adminUser.role !== 'ADMIN' && adminUser.role !== 'CEO') {
      throw new ForbiddenException('Only admin users can perform this action');
    }
    return this.service.delete(id, adminUser);
  }
}
