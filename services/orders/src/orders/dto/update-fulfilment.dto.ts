import {
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

import { FulfilmentStatus } from '@prisma/client';

export class UpdateFulfilmentDto {
    @IsEnum(FulfilmentStatus)
    status!: FulfilmentStatus;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    deliveryProvider?: string;

    @IsOptional()
    @IsString()
    @MaxLength(150)
    trackingReference?: string;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    operationalNotes?: string;
}