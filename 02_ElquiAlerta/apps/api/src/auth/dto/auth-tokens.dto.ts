import { ApiProperty } from '@nestjs/swagger';

export class AuthTokensDto {
  @ApiProperty()
  accessToken?: string;

  @ApiProperty()
  refreshToken?: string;

  @ApiProperty()
  role?: string;
}
