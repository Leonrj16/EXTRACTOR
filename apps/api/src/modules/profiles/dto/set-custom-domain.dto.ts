import { Matches } from 'class-validator';

export class SetCustomDomainDto {
  @Matches(/^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i, {
    message: 'Ese no parece un dominio válido (ej: midominio.com)',
  })
  domain!: string;
}
