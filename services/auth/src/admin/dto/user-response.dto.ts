export class UserResponseDto {
    id?: string;
    email?: string;
    role?: string;
    displayName?: string | null;
    bio?: string | null;
    tenantId?: string | null;
    createdAt?: Date;
}