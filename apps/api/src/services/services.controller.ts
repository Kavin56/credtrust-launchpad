import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('requests/me')
  list(@Req() req: any) {
    return this.servicesService.listRequests(req.user.userId);
  }

  @Post('requests')
  create(@Req() req: any, @Body('type') type: string, @Body('details') details: string) {
    return this.servicesService.createRequest(req.user.userId, type, details);
  }
}
