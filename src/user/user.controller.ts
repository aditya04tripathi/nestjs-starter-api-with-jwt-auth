import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiExtraModels,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
	getSchemaPath,
} from '@nestjs/swagger';
import { UserService } from 'src/user/user.service';
import { UpdateUserDto } from 'src/user/dto';
import { GetUserId } from 'src/utils/decorator';
import { UserProfileDto } from 'src/types';
import { JwtGuard } from 'src/utils/guards';

@ApiTags('User')
@ApiBearerAuth()
@ApiExtraModels(UserProfileDto)
@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('profile')
	@ApiOperation({ summary: 'Get authenticated user profile' })
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
	async getProfile(@GetUserId() userId: string) {
		return this.userService.findById(userId);
	}

	@Patch('profile')
	@ApiOperation({ summary: 'Update authenticated user profile' })
	@ApiBody({ type: UpdateUserDto })
	@ApiOkResponse({
		description: 'Profile updated successfully',
		schema: {
			type: 'object',
			properties: {
				data: { $ref: getSchemaPath(UserProfileDto) },
			},
		},
	})
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	async updateProfile(@GetUserId() userId: string, @Body() updateUserDto: UpdateUserDto) {
		return this.userService.updateUser(userId, updateUserDto);
	}
}
