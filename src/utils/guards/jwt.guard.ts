import { AuthGuard } from '@nestjs/passport';
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PRIVATE_KEY, ROLES_KEY } from 'src/utils/decorator';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
	constructor(private reflector: Reflector) {
		super();
	}

	canActivate(context: ExecutionContext) {
		const isPrivate = this.reflector.getAllAndOverride<boolean>(IS_PRIVATE_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (!isPrivate && !requiredRoles) {
			return true;
		}
		return super.canActivate(context);
	}
}
