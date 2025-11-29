import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import * as jwt from 'jsonwebtoken';

@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

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

  @Post()
  async create(
    @Body() body: { name: string; parentId?: string; description?: string; icon?: string; color?: string },
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserIdFromToken(auth);
    return this.foldersService.create(
      body.name,
      userId,
      body.parentId,
      body.description,
      body.icon,
      body.color,
    );
  }

  @Get()
  async findAll(@Headers('authorization') auth: string) {
    const userId = this.getUserIdFromToken(auth);
    return this.foldersService.findUserFolders(userId);
  }

  @Get('tree')
  async getTree(@Headers('authorization') auth: string) {
    const userId = this.getUserIdFromToken(auth);
    return this.foldersService.getFolderTree(userId);
  }

  @Get(':id/projects')
  async getProjectsByFolder(
    @Param('id') folderId: string,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserIdFromToken(auth);

    if (folderId === 'root') {
      // Proyectos sin carpeta
      return this.foldersService.getProjectsByFolder(userId, null);
    }

    return this.foldersService.getProjectsByFolder(userId, folderId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserIdFromToken(auth);
    return this.foldersService.findOne(id, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updates: any,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserIdFromToken(auth);
    return this.foldersService.update(id, userId, updates);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserIdFromToken(auth);
    return this.foldersService.delete(id, userId);
  }

  @Post('move-project')
  async moveProject(
    @Body() body: { projectId: string; folderId: string | null },
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserIdFromToken(auth);
    return this.foldersService.moveProjectToFolder(
      body.projectId,
      body.folderId,
      userId,
    );
  }

  @Post('reorder')
  async reorder(
    @Body() body: { folderIds: string[] },
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserIdFromToken(auth);
    return this.foldersService.reorder(userId, body.folderIds);
  }
};