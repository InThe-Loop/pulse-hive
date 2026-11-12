import { PaymentProvider } from '@prisma/client';

import {
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    IsNotEmpty,
    MaxLength,
    Min,
} from 'class-validator';

export class PaymentCompletedDto {
    @IsString()
    @IsNotEmpty()
    tenantId!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    transactionReference!: string;

    @IsOptional()
    @IsString()
    @MaxLength(150)
    providerReference?: string;

    @IsEnum(PaymentProvider)
    provider!: PaymentProvider;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    amount!: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(3)
    currency!: string;

    // Ozow transaction status metadata
    @IsOptional()
    @IsString()
    @MaxLength(100)
    ozowStatus?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    subStatus?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    statusMessage?: string;

    // Additional checkout/order information from Ozow
    @IsOptional()
    @IsString()
    @MaxLength(50)
    optional1?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    optional2?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    optional3?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    optional4?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    optional5?: string;
}
