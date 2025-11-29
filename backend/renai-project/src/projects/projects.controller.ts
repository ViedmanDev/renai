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
export class ProjectsController {
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

  // ========== ENDPOINTS DE COLABORADORES (ALIAS) ==========

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
}
