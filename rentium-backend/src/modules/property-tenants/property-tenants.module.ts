import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PropertyTenantsService } from './property-tenants.service';
import { PropertyTenantsController } from './property-tenants.controller';
import { PropertyTenant, PropertyTenantSchema } from './schemas/property-tenant.schema';
import { PropertyTenantRepository } from './repositories/property-tenant.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PropertyTenant.name, schema: PropertyTenantSchema }]),
  ],
  controllers: [PropertyTenantsController],
  providers: [PropertyTenantsService, PropertyTenantRepository],
  exports: [PropertyTenantsService, PropertyTenantRepository],
})
export class PropertyTenantsModule {}
