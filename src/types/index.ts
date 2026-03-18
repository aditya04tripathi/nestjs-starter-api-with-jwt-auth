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

export * from 'src/types/authenticated-user.type';
