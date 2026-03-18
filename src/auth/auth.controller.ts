import { Body, Controller, Get, Post, UseGuards, Patch } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiBody,
	ApiExtraModels,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiTooManyRequestsResponse,
	ApiUnauthorizedResponse,
	getSchemaPath,
} from '@nestjs/swagger';
import {
	AuthSignupDto,
	AuthSigninDto,
	ChangePasswordDto,
	ForgotPasswordDto,
	RefreshTokenDto,
	ResetPasswordDto,
} from 'src/auth/dto';
import { JwtGuard } from 'src/utils/guards';
import { GetUser, GetUserId, Private } from 'src/utils/decorator';
import { AuthenticatedUser, AuthTokensDto, MessageDto, UserProfileDto } from 'src/types';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@ApiExtraModels(AuthTokensDto, MessageDto, UserProfileDto)
@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('signin')
	@Throttle({ default: { ttl: 60000, limit: 10 } })
	@ApiOperation({ summary: 'Sign in and receive access/refresh tokens' })
	@ApiBody({ type: AuthSigninDto })
	@ApiOkResponse({
		description: 'Authentication successful',
		schema: {
			type: 'object',
			properties: {
				data: { $ref: getSchemaPath(AuthTokensDto) },
			},
		},
	})
	@ApiNotFoundResponse({ description: 'User was not found' })
	@ApiUnauthorizedResponse({ description: 'Invalid password' })
	@ApiTooManyRequestsResponse({ description: 'Too many sign-in attempts' })
	signin(@Body() dto: AuthSigninDto) {
		return this.authService.signin(dto);
	}

	@Post('signup')
	@ApiOperation({ summary: 'Create an account and receive access/refresh tokens' })
	@ApiBody({ type: AuthSignupDto })
	@ApiOkResponse({
		description: 'Signup successful',
		schema: {
			type: 'object',
			properties: {
				data: { $ref: getSchemaPath(AuthTokensDto) },
			},
		},
	})
	@ApiBadRequestResponse({ description: 'Validation failed' })
	signup(@Body() dto: AuthSignupDto) {
		return this.authService.signup(dto);
	}

	@Private()
	@UseGuards(JwtGuard)
	@Get('me')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get current authenticated user profile' })
	@ApiOkResponse({
		description: 'Profile fetched successfully',
		schema: {
			type: 'object',
			properties: {
				data: { $ref: getSchemaPath(UserProfileDto) },
			},
		},
	})
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	getMe(@GetUser() user: AuthenticatedUser) {
		return this.authService.getMe(user);
	}

	@Private()
	@UseGuards(JwtGuard)
	@Patch('change-password')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Change current user password' })
	@ApiBody({ type: ChangePasswordDto })
	@ApiOkResponse({
		description: 'Password changed successfully',
		schema: {
			type: 'object',
			properties: {
				data: { $ref: getSchemaPath(MessageDto) },
			},
		},
	})
	@ApiUnauthorizedResponse({ description: 'Current password is incorrect' })
	changePassword(@GetUserId() userId: string, @Body() changePasswordDto: ChangePasswordDto) {
		return this.authService.changePassword(userId, changePasswordDto);
	}

	@Post('forgot-password')
	@Throttle({ default: { ttl: 60000, limit: 5 } })
	@ApiOperation({ summary: 'Request a password reset token' })
	@ApiBody({ type: ForgotPasswordDto })
	@ApiOkResponse({
		description: 'Generic response to avoid account enumeration',
		schema: {
			type: 'object',
			properties: {
				data: { $ref: getSchemaPath(MessageDto) },
			},
		},
	})
	@ApiTooManyRequestsResponse({ description: 'Too many forgot-password attempts' })
	forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
		return this.authService.forgotPassword(forgotPasswordDto);
	}

	@Post('refresh')
	@ApiOperation({ summary: 'Rotate and return fresh access/refresh tokens' })
	@ApiBody({ type: RefreshTokenDto })
	@ApiOkResponse({
		description: 'Refresh token accepted',
		schema: {
			type: 'object',
			properties: {
				data: { $ref: getSchemaPath(AuthTokensDto) },
			},
		},
	})
	@ApiUnauthorizedResponse({ description: 'Invalid refresh token' })
	refresh(@Body() dto: RefreshTokenDto) {
		return this.authService.refreshToken(dto.refreshToken);
	}

	@Private()
	@UseGuards(JwtGuard)
	@Post('logout')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Revoke current refresh token state' })
	@ApiOkResponse({
		description: 'Logout successful',
		schema: {
			type: 'object',
			properties: {
				data: { $ref: getSchemaPath(MessageDto) },
			},
		},
	})
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	logout(@GetUserId() userId: string) {
		return this.authService.logout(userId);
	}

	@Post('reset-password')
	@ApiOperation({ summary: 'Reset password using email and reset token' })
	@ApiBody({ type: ResetPasswordDto })
	@ApiOkResponse({
		description: 'Password reset completed',
		schema: {
			type: 'object',
			properties: {
				data: { $ref: getSchemaPath(MessageDto) },
			},
		},
	})
	@ApiBadRequestResponse({ description: 'Invalid or expired reset token' })
	resetPassword(@Body() dto: ResetPasswordDto) {
		return this.authService.resetPassword(dto);
	}
}
