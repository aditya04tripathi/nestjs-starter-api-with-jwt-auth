import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { UpdateUserDto } from 'src/user/dto';
import { GetUserId } from 'src/utils/decorator';
import { JwtGuard } from 'src/utils/guards';

@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('profile')
	async getProfile(@GetUserId() userId: string) {
		return this.userService.findById(userId);
	}

	@Patch('profile')
	async updateProfile(@GetUserId() userId: string, @Body() updateUserDto: UpdateUserDto) {
		return this.userService.updateUser(userId, updateUserDto);
	}
}
