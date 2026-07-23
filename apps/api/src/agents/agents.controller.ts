import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { AllocationService } from './allocation.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { AssignCustomersDto } from './dto/assign-customers.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';

@ApiTags('admin-agents')
@ApiBearerAuth()
@Controller('admin/agents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgentsController {
  constructor(
    private readonly agentsService: AgentsService,
    private readonly allocationService: AllocationService,
  ) {}

  @Get()
  @Roles('ADMIN', 'CEO')
  @ApiOperation({ summary: 'List collection agents' })
  list() {
    return this.agentsService.listAgents();
  }

  @Post()
  @Roles('ADMIN', 'CEO')
  @ApiOperation({ summary: 'Create collection agent' })
  create(@Body() dto: CreateAgentDto) {
    return this.agentsService.createAgent(dto);
  }

  @Patch(':id/approve')
  @Roles('ADMIN', 'CEO')
  @ApiOperation({ summary: 'Approve agent registration' })
  approve(@Param('id') id: string, @Req() req: any) {
    const adminName = req.user?.email || 'Admin';
    return this.agentsService.approveAgent(id, adminName);
  }

  @Patch(':id/reject')
  @Roles('ADMIN', 'CEO')
  @ApiOperation({ summary: 'Reject agent registration' })
  reject(@Param('id') id: string) {
    return this.agentsService.rejectAgent(id);
  }

  @Get('admin-notifications')
  @Roles('ADMIN', 'CEO')
  @ApiOperation({ summary: 'Get admin notifications for agent registration requests' })
  adminNotifications() {
    return this.agentsService.getAdminNotifications();
  }

  @Get('allocation-dashboard')
  @Roles('ADMIN', 'CEO')
  @ApiOperation({ summary: 'Get pigmy user allocation dashboard stats' })
  allocationDashboard() {
    return this.allocationService.getAdminAllocationDashboard();
  }

  @Get('allocation-suggest')
  @Roles('ADMIN', 'CEO')
  @ApiOperation({ summary: 'Get suggested next agent for round-robin allocation' })
  allocationSuggest() {
    return this.allocationService.getSuggestedAgent();
  }

  @Post('allocate-user')
  @Roles('ADMIN', 'CEO')
  @ApiOperation({ summary: 'Allocate a Pigmy user to an agent using Round-Robin or manual selection' })
  allocateUser(@Body() body: { accountId: string; agentId?: string }, @Req() req: any) {
    const adminName = req.user?.email || 'Admin';
    return this.allocationService.allocatePigmyUser({
      accountId: body.accountId,
      agentId: body.agentId,
      adminName,
    });
  }

  @Post('reassign-user')
  @Roles('ADMIN', 'CEO')
  @ApiOperation({ summary: 'Reassign a Pigmy user to another agent' })
  reassignUser(@Body() body: { accountId: string; newAgentId: string }, @Req() req: any) {
    const adminName = req.user?.email || 'Admin';
    return this.allocationService.reassignPigmyUser({
      accountId: body.accountId,
      newAgentId: body.newAgentId,
      adminName,
    });
  }

  @Delete('allocation/:accountId')
  @Roles('ADMIN', 'CEO')
  @ApiOperation({ summary: 'Remove allocation from a Pigmy user' })
  removeAllocation(@Param('accountId') accountId: string) {
    return this.allocationService.removeAllocation(accountId);
  }

  @Patch('allocation-ratio')
  @Roles('ADMIN', 'CEO')
  @ApiOperation({ summary: 'Update pigmy user allocation ratio (e.g. 5, 10, 15)' })
  updateRatio(@Body() body: { ratio: number }) {
    return this.allocationService.updateConfiguredRatio(body.ratio);
  }

  @Get('agent-notifications')
  @Roles('AGENT', 'ADMIN', 'CEO')
  @ApiOperation({ summary: 'Get notifications for logged in agent' })
  getAgentNotifications(@Req() req: any, @Query('agentId') agentIdQuery?: string) {
    const agentId = req.user?.role === 'AGENT' ? req.user.sub || req.user.userId : agentIdQuery;
    return this.allocationService.getAgentNotifications(agentId);
  }

  @Patch('agent-notifications/:id/read')
  @Roles('AGENT', 'ADMIN', 'CEO')
  @ApiOperation({ summary: 'Mark agent notification as read' })
  markNotificationRead(@Param('id') id: string, @Req() req: any, @Query('agentId') agentIdQuery?: string) {
    const agentId = req.user?.role === 'AGENT' ? req.user.sub || req.user.userId : agentIdQuery;
    return this.allocationService.markNotificationRead(id, agentId);
  }

  @Patch('agent-notifications/read-all')
  @Roles('AGENT', 'ADMIN', 'CEO')
  @ApiOperation({ summary: 'Mark all notifications as read for agent' })
  markAllRead(@Req() req: any, @Query('agentId') agentIdQuery?: string) {
    const agentId = req.user?.role === 'AGENT' ? req.user.sub || req.user.userId : agentIdQuery;
    return this.allocationService.markAllNotificationsRead(agentId);
  }

  @Post('assign-customers')
  @Roles('ADMIN', 'CEO')
  @ApiOperation({ summary: 'Assign Pigmy accounts to an agent' })
  assign(@Body() dto: AssignCustomersDto) {
    return this.agentsService.assignCustomers(dto);
  }

  @Patch('unassign/:accountId')
  @Roles('ADMIN', 'CEO')
  @ApiOperation({ summary: 'Remove agent assignment from a Pigmy account' })
  unassign(@Param('accountId') accountId: string) {
    return this.agentsService.unassignCustomer(accountId);
  }

  @Get('accounts')
  @Roles('ADMIN', 'CEO')
  @ApiOperation({ summary: 'Search Pigmy accounts for assignment' })
  accounts(@Query('q') q?: string) {
    return this.agentsService.listAccountsForAssignment(q);
  }

  @Delete(':id')
  @Roles('ADMIN', 'CEO')
  @ApiOperation({ summary: 'Delete collection agent' })
  delete(@Param('id') id: string) {
    return this.agentsService.deleteAgent(id);
  }
}
