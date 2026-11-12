import {
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
} from 'class-validator';

export class UpsertCustomerProfileDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    address?: string | null;
}

export class CustomerProfileParamsDto {
    @IsString()
    @Matches(/^[A-Za-z0-9_-]{2,32}$/)
    tenantCode!: string;

    @IsString()
    @IsNotEmpty()
    identityId!: string;
}
