import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, Query, Patch } from '@nestjs/common';
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

  private actor(req: any) {
    return { role: req.user?.role as string, userId: req.user?.userId as string };
  }

  @Post('schemes')
  @Roles('ADMIN', 'CEO')
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
  @Roles('ADMIN', 'CEO', 'AGENT')
  @ApiOperation({ summary: 'Enroll a customer into a Pigmy scheme' })
  async enrollAccount(@Body() dto: EnrollPigmyAccountDto) {
    return this.pigmyService.enrollAccount(dto);
  }

  @Post('self-enroll')
  @Roles('MEMBER')
  @ApiOperation({ summary: 'Self-enroll into a Pigmy scheme (Member)' })
  async selfEnroll(@Body() dto: { schemeId: string; registeredId?: string; startDate?: string; endDate?: string; monthlyPaymentDate?: string }, @Request() req: any) {
    return this.pigmyService.selfEnroll(req.user.userId, dto.schemeId, dto.registeredId, dto.startDate, dto.endDate, dto.monthlyPaymentDate);
  }

  @Post('collection')
  @Roles('ADMIN', 'CEO', 'AGENT')
  @ApiOperation({ summary: 'Add a collection entry (cash or record)' })
  async addCollection(@Body() dto: AddCollectionDto, @Request() req: any) {
    const { role, userId } = this.actor(req);
    return this.pigmyService.addCollection(dto, userId, role);
  }

  @Post('pay')
  @Roles('MEMBER')
  @ApiOperation({ summary: 'Make a Pigmy payment (Member)' })
  async memberPay(@Body() dto: AddCollectionDto, @Request() req: any) {
    dto.method = 'UPI';
    return this.pigmyService.addCollection(dto, req.user.userId, 'MEMBER');
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
    return this.pigmyService.confirmPayment(dto.collectionId, dto.referenceId, req.user.userId);
  }

  @Get('my-collections')
  @Roles('MEMBER')
  @ApiOperation({ summary: 'Get personal collection history' })
  async getMyCollections(@Request() req: any) {
    return this.pigmyService.getMemberCollections(req.user.userId);
  }

  @Patch('collections/:id/status')
  @Roles('ADMIN', 'CEO', 'AGENT')
  @ApiOperation({ summary: 'Approve or reject a pending online collection' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCollectionStatusDto,
    @Request() req: any,
  ) {
    const { role, userId } = this.actor(req);
    return this.pigmyService.updateCollectionStatus(id, dto, userId, role);
  }

  @Get('collections/pending')
  @Roles('ADMIN', 'CEO', 'AGENT')
  @ApiOperation({ summary: 'Pending online collections (admin: all, agent: assigned)' })
  async getPending(@Request() req: any) {
    const { role, userId } = this.actor(req);
    return this.pigmyService.getPendingCollections(role, userId);
  }

  @Get('agent/customers')
  @Roles('AGENT')
  @ApiOperation({ summary: 'Assigned Pigmy customers for logged-in agent' })
  async getAgentCustomers(@Request() req: any) {
    return this.pigmyService.getAgentCustomers(req.user.userId);
  }

  @Get('applications')
  @Roles('ADMIN', 'CEO')
  @ApiOperation({ summary: 'List all Pigmy scheme enrollment applications (Admin)' })
  async getApplications(@Query('status') status?: string) {
    return this.pigmyService.listApplications(status);
  }

  @Put('applications/:id/status')
  @Roles('ADMIN', 'CEO')
  @ApiOperation({ summary: 'Approve, reject or wait Pigmy application (Admin)' })
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body() body: { status: string; remarks?: string; agentId?: string }
  ) {
    return this.pigmyService.updateStatus(id, body.status, body.remarks, body.agentId);
  }

  @Get('account/:number')
  @Roles('ADMIN', 'CEO', 'AGENT', 'MEMBER')
  @ApiOperation({ summary: 'Get details of a Pigmy account' })
  async getAccount(@Param('number') accountNumber: string, @Request() req: any) {
    const { role, userId } = this.actor(req);
    return this.pigmyService.getAccountDetails(accountNumber, userId, role);
  }

  @Post('interest/:id')
  @Roles('ADMIN', 'CEO')
  @ApiOperation({ summary: 'Trigger interest calculation for an account' })
  async calculateInterest(@Param('id') accountId: string) {
    return this.pigmyService.calculateInterest(accountId);
  }

  @Get('stats')
  @Roles('ADMIN', 'CEO', 'AGENT')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getStats(@Request() req: any) {
    const { role, userId } = this.actor(req);
    return this.pigmyService.getDashboardStats(role, userId);
  }

  @Get('search')
  @Roles('ADMIN', 'CEO', 'AGENT')
  @ApiOperation({ summary: 'Search accounts (agents: assigned only)' })
  async search(@Query('q') query: string, @Request() req: any) {
    const { role, userId } = this.actor(req);
    return this.pigmyService.searchAccount(query || '', role, userId);
  }

  @Get('collections/recent')
  @Roles('ADMIN', 'CEO', 'AGENT')
  @ApiOperation({ summary: 'Get recent collection entries' })
  async getRecentCollections(@Query('limit') limit?: number, @Request() req?: any) {
    const { role, userId } = this.actor(req);
    return this.pigmyService.getRecentCollections(limit, role, userId);
  }
}
