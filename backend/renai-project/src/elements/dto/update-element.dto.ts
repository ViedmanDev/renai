// src/elements/dto/update-element.dto.ts
export class UpdateElementDto {
  name?: string;
  description?: string;
  // NO incluir projectId ni parentElementId en updates
  // porque normalmente no se cambian después de crear
}
