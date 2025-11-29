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
import { ProjectsService } from './projects.service';
import { ProjectsPermissionsService } from './projects-permissions.service';
import { ProjectVisibility, ProjectRole } from '../schemas/project.schema';
import * as jwt from 'jsonwebtoken';

@Controller('projects')
export class ProjectsController   {
  constructor(
    private projectsService: ProjectsService,
    private permissionsService: ProjectsPermissionsService,
  ) {}

  // Método auxiliar para extraer userId del token
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
   * Crear nuevo proyecto
   */
  @Post()
  async create(
    @Headers('authorization') auth: string,
    @Body()
    body: {
      name: string;
      description?: string;
      coverImage?: string;
      fromTemplate?: boolean;
      visibility?: string;
      folderId?: string;
    },
  ) {
    const userId = this.getUserIdFromToken(auth);
    return this.projectsService.create(
      body.name,
      userId,
      body.description,
      body.coverImage,
      body.fromTemplate,
      body.visibility,
      body.folderId,
    );
  }

  /**
   * Obtener todos los proyectos del usuario
   */
  @Get()
  async findAll(@Headers('authorization') auth: string) {
    const userId = this.getUserIdFromToken(auth);
    return this.projectsService.findUserProjects(userId);
  }

  /**
  * Actualizar orden de proyectos
  */
  @Patch('reorder')
  async reorderProjects(
    @Headers('authorization') auth: string,
    @Body() body: { projectIds: string[] },
  ) {
    console.log('📬 PATCH /projects/reorder');
    console.log('📝 Nuevo orden:', body.projectIds);

    const userId = this.getUserIdFromToken(auth);
    return this.projectsService.reorderProjects(userId, body.projectIds);
  }

  /**
   * Obtener un proyecto por ID
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserIdFromToken(auth);

    // Verificar acceso
    await this.permissionsService.requireAccess(id, userId);

    return this.projectsService.findOne(id, userId);
  }

  /**
   * Obtener proyecto por slug público
   */
  @Get('public/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.projectsService.findBySlug(slug);
  }

  /**
   * Actualizar proyecto
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
    @Body() updates: any,
  ) {
    const userId = this.getUserIdFromToken(auth);

    // Verificar permiso de edición
    await this.permissionsService.requireEdit(id, userId);

    return this.projectsService.update(id, updates);
  }

  /**
   * Actualizar detalles seleccionados
   */
  @Patch(':id/details')
  async updateDetails(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
    @Body() body: { selectedDetails: any[] },
  ) {
    const userId = this.getUserIdFromToken(auth);
    await this.permissionsService.requireEdit(id, userId);

    return this.projectsService.updateSelectedDetails(id, body.selectedDetails);
  }

  /**
   * Actualizar campos personalizados (EAV)
   */
  @Patch(':id/custom-fields')
  async updateCustomFields(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
    @Body() body: { customFields: Array<{ field: string; value: any }> },
  ) {
    const userId = this.getUserIdFromToken(auth);
    await this.permissionsService.requireEdit(id, userId);

    return this.projectsService.updateCustomFields(id, body.customFields || []);
  }

  /**
   * Validar campos personalizados (sin guardar)
   */
  @Post(':id/custom-fields/validate')
  async validateCustomFields(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
    @Body() body: { customFields: Array<{ field: string; value: any }> },
  ) {
    const userId = this.getUserIdFromToken(auth);
    await this.permissionsService.requireAccess(id, userId);
    const normalized = await this.projectsService.validateCustomFields(
      body.customFields || [],
    );
    return { ok: true, normalized };
  }

  /**
   * Obtener definiciones de campos + valores del proyecto
   */
  @Get(':id/custom-fields')
  async getFieldsWithValues(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserIdFromToken(auth);
    await this.permissionsService.requireAccess(id, userId);
    return this.projectsService.getFieldsWithValues(id);
  }

  /**
   * Eliminar proyecto
   */
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserIdFromToken(auth);
    return this.projectsService.delete(id, userId);
  }

  // ========== ENDPOINTS DE PRIVACIDAD ==========

  /**
   * Cambiar visibilidad del proyecto
   */
  @Patch(':id/visibility')
  async changeVisibility(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
    @Body() body: { visibility: ProjectVisibility },
  ) {
    const userId = this.getUserIdFromToken(auth);
    return this.permissionsService.changeVisibility(
      id,
      userId,
      body.visibility,
    );
  }

  /**
   * Generar slug público
   */
  @Post(':id/public-link')
  async generatePublicLink(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserIdFromToken(auth);
    await this.permissionsService.requireOwner(id, userId);

    const slug = await this.projectsService.generatePublicSlug(id);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    return {
      slug,
      publicUrl: `${frontendUrl}/public/project/${slug}`,
    };
  }

  /**
   * Otorgar permiso a un usuario
   */
  @Post(':id/permissions')
  async grantPermission(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
    @Body() body: { email: string; role: ProjectRole },
  ) {
    const userId = this.getUserIdFromToken(auth);
    return this.permissionsService.grantPermission(
      id,
      userId,
      body.email,
      body.role,
    );
  }

  /**
   * Revocar permiso de un usuario
   */
  @Delete(':id/permissions/:userId')
  async revokePermission(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserIdFromToken(auth);
    return this.permissionsService.revokePermission(id, userId, targetUserId);
  }

  /**
   * Obtener usuarios con acceso al proyecto
   */
  @Get(':id/users')
  async getProjectUsers(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserIdFromToken(auth);
    return this.permissionsService.getProjectUsers(id, userId);
  }

  /**
   * Obtener rol del usuario actual en el proyecto
   */
  @Get(':id/my-role')
  async getMyRole(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserIdFromToken(auth);
    const role = await this.permissionsService.getUserRole(id, userId);

    return { role };
  }

  /**
   * Agregar colaborador (alias de grantPermission)
   */
  @Post(':id/collaborators')
  async addCollaborator(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
    @Body() body: { email: string; role: ProjectRole },
  ) {
    console.log(`📬 POST /projects/${id}/collaborators`);
    console.log(`📧 Email: ${body.email}, Rol: ${body.role}`);
    const userId = this.getUserIdFromToken(auth);
    return this.permissionsService.grantPermission(
      id,
      userId,
      body.email,
      body.role,
    );
  }

  /**
   * Listar colaboradores (alias de getProjectUsers)
   */
  @Get(':id/collaborators')
  async getCollaborators(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    console.log(`📬 GET /projects/${id}/collaborators`);
    const userId = this.getUserIdFromToken(auth);
    return this.permissionsService.getProjectUsers(id, userId);
  }

  /**
   * Actualizar rol de colaborador
   */
  @Patch(':id/collaborators/:userId')
  async updateCollaboratorRole(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @Headers('authorization') auth: string,
    @Body() body: { role: ProjectRole },
  ) {
    console.log(`📬 PATCH /projects/${id}/collaborators/${targetUserId}`);
    console.log(`📝 Nuevo rol: ${body.role}`);

    const userId = this.getUserIdFromToken(auth);

    // Usar el nuevo método updatePermissionRole
    return this.permissionsService.updatePermissionRole(
      id,
      userId,
      targetUserId,
      body.role,
    );
  }

  /**
   * Remover colaborador (alias de revokePermission)
   */
  @Delete(':id/collaborators/:userId')
  async removeCollaborator(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @Headers('authorization') auth: string,
  ) {
    console.log(`📬 DELETE /projects/${id}/collaborators/${targetUserId}`);
    const userId = this.getUserIdFromToken(auth);
    return this.permissionsService.revokePermission(id, userId, targetUserId);
  }

  // ========== ENDPOINTS DE GRUPOS EN PROYECTOS ==========

  /**
   * Otorgar permiso a un grupo
   */
  @Post(':id/group-permissions')
  async grantGroupPermission(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
    @Body() body: { groupId: string; role: ProjectRole },
  ) {
    console.log(`📬 POST /projects/${id}/group-permissions`);
    console.log(`👥 Grupo: ${body.groupId}, Rol: ${body.role}`);

    const userId = this.getUserIdFromToken(auth);
    return this.permissionsService.grantGroupPermission(
      id,
      userId,
      body.groupId,
      body.role,
    );
  }

  /**
   * Listar grupos con acceso al proyecto
   */
  @Get(':id/group-permissions')
  async getProjectGroups(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    console.log(`📬 GET /projects/${id}/group-permissions`);
    const userId = this.getUserIdFromToken(auth);
    return this.permissionsService.getProjectGroups(id, userId);
  }

  /**
   * Actualizar rol de un grupo
   */
  @Patch(':id/group-permissions/:groupId')
  async updateGroupPermission(
    @Param('id') id: string,
    @Param('groupId') groupId: string,
    @Headers('authorization') auth: string,
    @Body() body: { role: ProjectRole },
  ) {
    console.log(`📬 PATCH /projects/${id}/group-permissions/${groupId}`);
    console.log(`📝 Nuevo rol: ${body.role}`);

    const userId = this.getUserIdFromToken(auth);

    // Revocar permiso anterior y otorgar nuevo
    await this.permissionsService.revokeGroupPermission(id, userId, groupId);
    return this.permissionsService.grantGroupPermission(
      id,
      userId,
      groupId,
      body.role,
    );
  }

  /**
   * Revocar permiso de un grupo
   */
  @Delete(':id/group-permissions/:groupId')
  async revokeGroupPermission(
    @Param('id') id: string,
    @Param('groupId') groupId: string,
    @Headers('authorization') auth: string,
  ) {
    console.log(`📬 DELETE /projects/${id}/group-permissions/${groupId}`);
    const userId = this.getUserIdFromToken(auth);
    return this.permissionsService.revokeGroupPermission(id, userId, groupId);
  }

  /**
   * Obtener grupos disponibles del usuario para agregar al proyecto
   */
  @Get(':id/available-groups')
  async getAvailableGroups(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    console.log(`📬 GET /projects/${id}/available-groups`);
    const userId = this.getUserIdFromToken(auth);

    // Verificar que sea owner del proyecto
    await this.permissionsService.requireOwner(id, userId);

    // Obtener grupos del usuario
    return this.permissionsService.getUserGroups(userId);
  }
}
