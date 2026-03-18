import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
	@ApiProperty({ example: 'user@example.com' })
	@IsEmail()
	email: string;

	@ApiProperty({ example: 'cf2b516d-6df7-4f28-9f88-2f7f281f2fa4' })
	@IsString()
	@IsNotEmpty()
	token: string;

	@ApiProperty({ example: 'NewPassword123!' })
	@IsString()
	@MinLength(8)
	newPassword: string;
}
