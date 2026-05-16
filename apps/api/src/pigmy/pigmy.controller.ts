import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, Patch } from '@nestjs/common';
import { PigmyService } from './pigmy.service';
import { CreatePigmySchemeDto, EnrollPigmyAccountDto, AddCollectionDto, UpdateCollectionStatusDto, InitiatePaymentDto, ConfirmPaymentDto } from './dto/pigmy.dto';
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

  @Post('self-enroll')
  @Roles('MEMBER')
  @ApiOperation({ summary: 'Self-enroll into a Pigmy scheme (Member)' })
  async selfEnroll(@Body() dto: { schemeId: string }, @Request() req: any) {
    return this.pigmyService.selfEnroll(req.user.userId, dto.schemeId);
  }

  @Post('collection')
  @Roles('ADMIN', 'AGENT', 'COLLECTOR')
  @ApiOperation({ summary: 'Add a collection entry (Agent/Admin)' })
  async addCollection(@Body() dto: AddCollectionDto, @Request() req: any) {
    return this.pigmyService.addCollection(dto, req.user.userId);
  }

  @Post('pay')
  @Roles('MEMBER')
  @ApiOperation({ summary: 'Make a Pigmy payment (Member)' })
  async memberPay(@Body() dto: AddCollectionDto, @Request() req: any) {
    // Force method to UPI for member self-pay
    dto.method = 'UPI';
    return this.pigmyService.addCollection(dto, req.user.userId);
  }

  @Post('pay/initiate')
  @Roles('MEMBER')
  @ApiOperation({ summary: 'Initiate a Pigmy payment (Member)' })
  async initiatePayment(@Body() dto: InitiatePaymentDto, @Request() req: any) {
    return this.pigmyService.initiatePayment(dto, req.user.userId);
  }

  @Post('pay/confirm')
  @Roles('MEMBER')
  @ApiOperation({ summary: 'Confirm a Pigmy payment (Member)' })
  async confirmPayment(@Body() dto: ConfirmPaymentDto, @Request() req: any) {
    return this.pigmyService.confirmPayment(dto.collectionId, dto.referenceId);
  }

  @Get('my-collections')
  @Roles('MEMBER')
  @ApiOperation({ summary: 'Get personal collection history' })
  async getMyCollections(@Request() req: any) {
    return this.pigmyService.getMemberCollections(req.user.userId);
  }

  @Patch('collections/:id/status')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update collection status (Admin only)' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateCollectionStatusDto) {
    return this.pigmyService.updateCollectionStatus(id, dto);
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

  @Get('collections/recent')
  @Roles('ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Get recent collection entries' })
  async getRecentCollections(@Query('limit') limit?: number) {
    return this.pigmyService.getRecentCollections(limit);
  }
}
