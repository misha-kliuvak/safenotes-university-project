import { PickType } from '@nestjs/swagger';
import { UpdateUserDto } from "@/modules/user/dto/update-user.dto";

export class UpdateEmailUserDto extends PickType(UpdateUserDto, ['email'] as const) {}
