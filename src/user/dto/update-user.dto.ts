import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UpdateUserDto {
	@ApiPropertyOptional({ example: 'Updated Name' })
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional({ example: 'updated@example.com' })
	@IsOptional()
	@IsEmail()
	email?: string;
}
