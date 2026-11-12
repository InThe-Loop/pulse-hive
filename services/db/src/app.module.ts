import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { ProductsModule } from './products/products.module';
import { TenantsModule } from './tenants/tenants.module';
import { IdentityModule } from './identity/identity.module';
import { AccessModule } from './access/access.module';
import { CustomersModule } from './customers/customers.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: Joi.object({
                NODE_ENV: Joi.string()
                .valid('development', 'test', 'production')
                .default('development'),

                PORT: Joi.number().default(4003).required(),

                DATABASE_URL: Joi.string().uri().required(),

                INTERNAL_SERVICE_KEY: Joi.string().trim().min(1).required(),
            }),
        }),

        DatabaseModule,
        HealthModule,
        TenantsModule,
        ProductsModule,
        IdentityModule,
        AccessModule,
        CustomersModule,
    ],
})

export class AppModule {}
