import {
    IsString,
    Matches,
    MaxLength,
} from 'class-validator';

export class CreateOtpChallengeDto {
    @IsString()
    @Matches(/^\+[1-9]\d{7,14}$/, {
        message: 'Phone number must be in E.164 format',
    })
    phone!: string;

    @IsString()
    @Matches(/^[a-fA-F0-9]{64}$/, {
        message: 'Invalid OTP hash',
    })
    @MaxLength(64)
    codeHash!: string;
}