import { IsString, Matches } from 'class-validator';

export class RequestOtpDto {
    @IsString()
    @Matches(/^\+[1-9]\d{7,14}$/, {
        message: 'Phone number must be in E.164 format',
    })
    phone!: string;
}