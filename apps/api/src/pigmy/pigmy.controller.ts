import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { PigmyService } from './pigmy.service';
import { CreatePigmySchemeDto, EnrollPigmyAccountDto, AddCollectionDto } from './dto/pigmy.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('pigmy')
@ApiBearerAuth()
@Controller('pigmy')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PigmyController {
  constructor(private readonly pigmyService: PigmyService) {}

  @Post('schemes')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new Pigmy scheme (Admin only)' })
  async createScheme(@Body() dto: CreatePigmySchemeDto) {
    return this.pigmyService.createScheme(dto);
  }

  @Get('schemes')
  @ApiOperation({ summary: 'Get all active Pigmy schemes' })
  async getSchemes() {
    return this.pigmyService.getSchemes();
  }

  @Post('enroll')
  @Roles('ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Enroll a customer into a Pigmy scheme' })
  async enrollAccount(@Body() dto: EnrollPigmyAccountDto) {
    return this.pigmyService.enrollAccount(dto);
  }

  @Post('collection')
  @Roles('ADMIN', 'AGENT', 'COLLECTOR')
  @ApiOperation({ summary: 'Add a collection entry (Agent/Admin)' })
  async addCollection(@Body() dto: AddCollectionDto, @Request() req) {
    return this.pigmyService.addCollection(dto, req.user.id);
  }

  @Get('account/:number')
  @ApiOperation({ summary: 'Get details of a Pigmy account' })
  async getAccount(@Param('number') accountNumber: string) {
    return this.pigmyService.getAccountDetails(accountNumber);
  }

  @Post('interest/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Trigger interest calculation for an account' })
  async calculateInterest(@Param('id') accountId: string) {
    return this.pigmyService.calculateInterest(accountId);
  }

  @Get('stats')
  @Roles('ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getStats() {
    return this.pigmyService.getDashboardStats();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search accounts by ID, name or phone' })
  async search(@Query('q') query: string) {
    return this.pigmyService.searchAccount(query);
  }
}
