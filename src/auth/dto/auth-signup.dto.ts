import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthSignupDto {
	@ApiProperty({ example: 'user@example.com' })
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiProperty({ example: 'Password123!' })
	@IsNotEmpty()
	password: string;

	@ApiProperty({ example: 'Aditya' })
	@IsNotEmpty()
	@IsString()
	name: string;
}
