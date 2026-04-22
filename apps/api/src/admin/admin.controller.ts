import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('admin')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Disabled for manual testing/demo
@Controller('admin')
export class AdminController {
  @Get('overview')
  async overview() {
    return { 
      members: 8200, 
      loans: 124, 
      deposits: 450, 
      pendingKyc: 12 
    };
  }
}
