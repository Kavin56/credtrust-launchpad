import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PortalAuthService } from './portal-auth.service';
import { AdminPortalLoginDto } from './dto/admin-portal-login.dto';
import { AgentPortalLoginDto } from './dto/agent-portal-login.dto';

@ApiTags('portal-auth')
@Controller('auth')
export class PortalAuthController {
  constructor(private readonly portalAuth: PortalAuthService) {}

  @Post('admin/login')
  adminLogin(@Body() dto: AdminPortalLoginDto) {
    return this.portalAuth.adminLogin(dto);
  }

  @Post('agent/login')
  agentLogin(@Body() dto: AgentPortalLoginDto) {
    return this.portalAuth.agentLogin(dto);
  }
}
