import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { StorageService } from './storage.service';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const VALID_KEY_RE = /^[\w-]+\/[\w-]+\.\w{2,4}$/;

@ApiTags('Storage')
@ApiBearerAuth()
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file to MinIO — returns object key' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ key: string }> {
    if (!file) throw new BadRequestException('No file provided');
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG and WebP images are allowed');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File exceeds 5MB limit');
    }

    const key = await this.storageService.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
      'reports',
    );
    return { key };
  }

  @Get('url')
  @ApiOperation({ summary: 'Get pre-signed URL for an object key' })
  async getUrl(@Query('key') key: string): Promise<{ url: string }> {
    if (!key) throw new BadRequestException('key is required');
    if (!VALID_KEY_RE.test(key)) {
      throw new BadRequestException('Invalid key format');
    }
    const url = await this.storageService.getPresignedUrl(key);
    return { url };
  }
}
