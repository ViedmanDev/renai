import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group, GroupDocument } from '../schemas/group.schema';
import { User } from '../schemas/user.schema';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(name: string, description: string, ownerId: string) {
    const group = new this.groupModel({
      name,
      description,
      ownerId: new Types.ObjectId(ownerId),
      members: [],
      memberCount: 0,
    });

    await group.save();
    console.log(`✅ Grupo creado: ${name}`);
    return group;
  }

  async findUserGroups(userId: string) {
    const ownedGroups = await this.groupModel
      .find({ ownerId: new Types.ObjectId(userId) })
      .exec();

    const memberGroups = await this.groupModel
      .find({ 'members.userId': new Types.ObjectId(userId) })
      .exec();

    return {
      owned: ownedGroups,
      member: memberGroups,
    };
  }

  async findById(groupId: string) {
    const group = await this.groupModel.findById(groupId).exec();
    if (!group) {
      throw new NotFoundException('Grupo no encontrado');
    }
    return group;
  }

  async addMember(groupId: string, ownerId: string, userEmail: string) {
    const group = await this.findById(groupId);

    if (group.ownerId.toString() !== ownerId) {
      throw new ForbiddenException('Solo el propietario puede agregar miembros');
    }

    const user = await this.userModel.findOne({ 
      email: userEmail.toLowerCase().trim() 
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado con ese email');
    }

    const userId = user._id.toString();

    if (userId === ownerId) {
      throw new BadRequestException('El propietario ya tiene acceso total');
    }

    const alreadyMember = group.members.some(
      (m) => m.userId.toString() === userId,
    );

    if (alreadyMember) {
      throw new BadRequestException('El usuario ya es miembro del grupo');
    }

    group.members.push({
      userId: user._id,
      addedAt: new Date(),
      addedBy: new Types.ObjectId(ownerId),
    });

    group.memberCount = group.members.length;
    await group.save();

    console.log(`✅ Miembro agregado al grupo: ${userEmail}`);
    return group;
  }

  async removeMember(groupId: string, ownerId: string, memberUserId: string) {
    const group = await this.findById(groupId);

    if (group.ownerId.toString() !== ownerId) {
      throw new ForbiddenException('Solo el propietario puede remover miembros');
    }

    const initialCount = group.members.length;

    group.members = group.members.filter(
      (m) => m.userId.toString() !== memberUserId,
    );

    if (group.members.length === initialCount) {
      throw new BadRequestException('El usuario no es miembro del grupo');
    }

    group.memberCount = group.members.length;
    await group.save();

    console.log(`🚫 Miembro removido del grupo: ${memberUserId}`);
    return group;
  }

  async getGroupMembers(groupId: string, requesterId: string) {
    const group = await this.findById(groupId);

    const hasAccess =
      group.ownerId.toString() === requesterId ||
      group.members.some((m) => m.userId.toString() === requesterId);

    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este grupo');
    }

    const populatedMembers = await Promise.all(
      group.members.map(async (member) => {
        const user = await this.userModel
          .findById(member.userId)
          .select('name email picture');

        return {
          userId: member.userId,
          addedAt: member.addedAt,
          user: user
            ? {
                name: user.name,
                email: user.email,
                picture: user.picture,
              }
            : null,
        };
      }),
    );

    const owner = await this.userModel
      .findById(group.ownerId)
      .select('name email picture');

    return {
      group: {
        id: group._id,
        name: group.name,
        description: group.description,
        memberCount: group.memberCount,
      },
      owner: owner,
      members: populatedMembers,
    };
  }

  async update(groupId: string, ownerId: string, updates: { name?: string; description?: string }) {
    const group = await this.findById(groupId);

    if (group.ownerId.toString() !== ownerId) {
      throw new ForbiddenException('Solo el propietario puede editar el grupo');
    }

    if (updates.name) group.name = updates.name;
    if (updates.description !== undefined) group.description = updates.description;

    await group.save();
    console.log(`✏️ Grupo actualizado: ${group.name}`);
    return group;
  }

  async delete(groupId: string, ownerId: string) {
    const group = await this.findById(groupId);

    if (group.ownerId.toString() !== ownerId) {
      throw new ForbiddenException('Solo el propietario puede eliminar el grupo');
    }

    await this.groupModel.findByIdAndDelete(groupId);
    console.log(`🗑️ Grupo eliminado: ${group.name}`);
    return { success: true, message: 'Grupo eliminado correctamente' };
  }
}