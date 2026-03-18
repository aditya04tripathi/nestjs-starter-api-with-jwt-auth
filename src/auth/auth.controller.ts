import { Body, Controller, Get, Post, UseGuards, Patch } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import {
	AuthSignupDto,
	AuthSigninDto,
	ChangePasswordDto,
	ForgotPasswordDto,
	RefreshTokenDto,
	ResetPasswordDto,
} from 'src/auth/dto';
import { JwtGuard } from 'src/utils/guards';
import { GetUser, GetUserId, Public } from 'src/utils/decorator';
import { AuthenticatedUser } from 'src/types';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Public()
	@Post('signin')
	@Throttle({ default: { ttl: 60000, limit: 10 } })
	signin(@Body() dto: AuthSigninDto) {
		return this.authService.signin(dto);
	}

	@Public()
	@Post('signup')
	signup(@Body() dto: AuthSignupDto) {
		return this.authService.signup(dto);
	}

	@UseGuards(JwtGuard)
	@Get('me')
	getMe(@GetUser() user: AuthenticatedUser) {
		return this.authService.getMe(user);
	}

	@UseGuards(JwtGuard)
	@Patch('change-password')
	changePassword(@GetUserId() userId: string, @Body() changePasswordDto: ChangePasswordDto) {
		return this.authService.changePassword(userId, changePasswordDto);
	}

	@Public()
	@Post('forgot-password')
	@Throttle({ default: { ttl: 60000, limit: 5 } })
	forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
		return this.authService.forgotPassword(forgotPasswordDto);
	}

	@Public()
	@Post('refresh')
	refresh(@Body() dto: RefreshTokenDto) {
		return this.authService.refreshToken(dto.refreshToken);
	}

	@UseGuards(JwtGuard)
	@Post('logout')
	logout(@GetUserId() userId: string) {
		return this.authService.logout(userId);
	}

	@Public()
	@Post('reset-password')
	resetPassword(@Body() dto: ResetPasswordDto) {
		return this.authService.resetPassword(dto);
	}
}
