import { PaymentProvider } from '@prisma/client';

import { Type } from 'class-transformer';

import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    IsUUID,
    Max,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';

export class CreatePendingOrderItemDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    productId!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    productName!: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    sku?: string;

    @IsInt()
    @Min(1)
    @Max(10000)
    quantity!: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    unitPrice!: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    totalPrice!: number;
}

export class CreatePendingOrderDto {
    @IsString()
    @IsNotEmpty()
    tenantId!: string;

    @IsUUID('4')
    idempotencyKey!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    customerName!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    phoneNumber!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    deliveryAddress!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    shippingMethod!: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    shippingFee!: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    subtotal!: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    totalAmount!: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    transactionReference!: string;

    @IsEnum(PaymentProvider)
    provider!: PaymentProvider;

    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(100)
    @ValidateNested({ each: true })
    @Type(() => CreatePendingOrderItemDto)
    items!: CreatePendingOrderItemDto[];
}

export class SavePaymentRequestDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    paymentRequestId!: string;

    @IsUrl({
        require_protocol: true,
        protocols: ['https'],
    })
    gatewayUrl!: string;
}
