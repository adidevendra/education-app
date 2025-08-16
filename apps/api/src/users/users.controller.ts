import { Controller, Get, Post, Body, UseGuards, Patch, Param, Req } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

const CreateUserDto = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(['ADMIN', 'EDITOR', 'REVIEWER', 'LEARNER']).optional(),
});

type CreateUserDto = z.infer<typeof CreateUserDto>;

const UpdateUserDto = CreateUserDto.partial();

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'List users' })
  async list() {
    return this.usersService.findAll();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'User created' })
  async create(@Body(new ZodValidationPipe(CreateUserDto)) body: CreateUserDto) {
    return this.usersService.create(body as any);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'User updated' })
  async update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateUserDto)) body: Partial<CreateUserDto>) {
    return this.usersService.update(id, body as any);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async me(@Req() req: any) {
    const u = req.user || {};
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      createdAt: u.createdAt,
    };
  }
}
