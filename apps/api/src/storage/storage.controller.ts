import { Controller, Get, Query, Res, HttpException, HttpStatus } from '@nestjs/common';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('view')
  async viewFile(@Query('path') storagePath: string, @Res() res: any) {
    if (!storagePath) {
      throw new HttpException('Path parameter is required', HttpStatus.BAD_REQUEST);
    }
    try {
      const fileData = await this.storageService.getFileBuffer(storagePath);
      if (!fileData) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }
      res.header('Content-Type', fileData.contentType);
      res.header('Cache-Control', 'public, max-age=86400');
      return res.send(fileData.buffer);
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      throw new HttpException('Failed to retrieve file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
