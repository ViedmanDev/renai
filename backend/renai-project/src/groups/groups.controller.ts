import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import * as jwt from 'jsonwebtoken';

@Controller('groups')
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  private getUserIdFromToken(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'SECRET_KEY',
    ) as { id: string; email: string };

    return decoded.id;
  }

  /**
   * Crear nuevo grupo
   */
  @Post()
  async create(
    @Headers('authorization') auth: string,
    @Body() body: { name: string; description?: string },
  ) {
    const userId = this.getUserIdFromToken(auth);
    console.log('📬 POST /groups - Crear grupo:', body.name);
    return this.groupsService.create(body.name, body.description || '', userId);
  }

  /**
   * Obtener grupos del usuario
   */
  @Get()
  async getMyGroups(@Headers('authorization') auth: string) {
    const userId = this.getUserIdFromToken(auth);
    console.log('📬 GET /groups - Obtener grupos del usuario');
    return this.groupsService.findUserGroups(userId);
  }

  /**
   * Obtener un grupo específico
   */
  @Get(':id')
  async getGroup(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserIdFromToken(auth);
    console.log('📬 GET /groups/:id - Obtener grupo');
    return this.groupsService.findById(id);
  }

  /**
   * Actualizar grupo
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
    @Body() body: { name?: string; description?: string },
  ) {
    const userId = this.getUserIdFromToken(auth);
    console.log('📬 PATCH /groups/:id - Actualizar grupo');
    return this.groupsService.update(id, userId, body);
  }

  /**
   * Eliminar grupo
   */
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserIdFromToken(auth);
    console.log('📬 DELETE /groups/:id - Eliminar grupo');
    return this.groupsService.delete(id, userId);
  }

  /**
   * Agregar miembro al grupo
   */
  @Post(':id/members')
  async addMember(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
    @Body() body: { email: string },
  ) {
    const userId = this.getUserIdFromToken(auth);
    console.log('📬 POST /groups/:id/members - Agregar miembro:', body.email);
    return this.groupsService.addMember(id, userId, body.email);
  }

  /**
   * Obtener miembros del grupo
   */
  @Get(':id/members')
  async getMembers(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserIdFromToken(auth);
    console.log('📬 GET /groups/:id/members - Obtener miembros');
    return this.groupsService.getGroupMembers(id, userId);
  }

  /**
   * Remover miembro del grupo
   */
  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') id: string,
    @Param('userId') memberUserId: string,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserIdFromToken(auth);
    console.log('📬 DELETE /groups/:id/members/:userId - Remover miembro');
    return this.groupsService.removeMember(id, userId, memberUserId);
  }
}