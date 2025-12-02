// src/elements/dto/create-element.dto.ts
export class CreateElementDto {
  name: string;
  description?: string;
  projectId: string;
  parentElementId?: string;
}
