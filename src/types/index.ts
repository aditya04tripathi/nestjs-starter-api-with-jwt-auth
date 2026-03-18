import { ApiProperty } from '@nestjs/swagger';

export interface User {
	id: string;
	email: string;
	username?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface JwtPayload {
	sub: string;
	email: string;
	iat: number;
}

export interface AuthTokens {
	access_token: string;
	refresh_token: string;
}

export interface AuthenticatedUser {
	id: string;
	name: string;
	email: string;
}

export class AuthTokensDto {
	@ApiProperty({
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
	})
	access_token: string;

	@ApiProperty({
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
	})
	refresh_token: string;
}

export class MessageDto {
	@ApiProperty({ example: 'Operation completed successfully' })
	message: string;
}

export class UserProfileDto {
	@ApiProperty({ format: 'uuid', example: '12b8db5d-c918-46ed-85df-4b5f487d81a0' })
	id: string;

	@ApiProperty({ example: 'user@example.com' })
	email: string;

	@ApiProperty({ example: 'Aditya' })
	name: string;
}
