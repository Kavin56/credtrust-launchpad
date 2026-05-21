import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { AssignCustomersDto } from './dto/assign-customers.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';

@ApiTags('admin-agents')
@ApiBearerAuth()
@Controller('admin/agents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'CEO')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  @ApiOperation({ summary: 'List collection agents' })
  list() {
    return this.agentsService.listAgents();
  }

  @Post()
  @ApiOperation({ summary: 'Create collection agent (username/password)' })
  create(@Body() dto: CreateAgentDto) {
    return this.agentsService.createAgent(dto);
  }

  @Post('assign-customers')
  @ApiOperation({ summary: 'Assign Pigmy accounts to an agent' })
  assign(@Body() dto: AssignCustomersDto) {
    return this.agentsService.assignCustomers(dto);
  }

  @Patch('unassign/:accountId')
  @ApiOperation({ summary: 'Remove agent assignment from a Pigmy account' })
  unassign(@Param('accountId') accountId: string) {
    return this.agentsService.unassignCustomer(accountId);
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Search Pigmy accounts for assignment' })
  accounts(@Query('q') q?: string) {
    return this.agentsService.listAccountsForAssignment(q);
  }
}
