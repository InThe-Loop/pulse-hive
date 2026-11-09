import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim().toLowerCase() : value,
    )
    @IsEmail({}, { message: 'Please provide a valid email address.' })
    email!: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long.' })
    password!: string;

    @IsString()
    @IsOptional()
    displayName?: string;
}
