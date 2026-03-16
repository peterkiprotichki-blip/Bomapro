import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PropertyTenantRepository } from './repositories/property-tenant.repository';
import { CreatePropertyTenantDto, UpdatePropertyTenantDto } from './dto/property-tenant.dto';

@Injectable()
export class PropertyTenantsService {
  constructor(private readonly propertyTenantRepository: PropertyTenantRepository) {}

  async create(dto: CreatePropertyTenantDto, tenantId: string) {
    const existing = await this.propertyTenantRepository.findByEmail(tenantId, dto.email);
    if (existing) {
      throw new ConflictException('A tenant with this email already exists');
    }
    return this.propertyTenantRepository.create({ ...dto, tenantId } as any);
  }

  async findAll(tenantId: string, page = 1, limit = 20, search?: string) {
    const filter: any = { tenantId };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { idNumber: { $regex: search, $options: 'i' } },
      ];
    }
    return this.propertyTenantRepository.findPaginated({ page, limit, filter });
  }

  async findById(id: string, tenantId: string) {
    const tenant = await this.propertyTenantRepository.findById(id);
    if (!tenant || tenant.isDeleted || tenant.tenantId !== tenantId) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  async findByProperty(tenantId: string, propertyId: string) {
    return this.propertyTenantRepository.findByProperty(tenantId, propertyId);
  }

  async update(id: string, tenantId: string, dto: UpdatePropertyTenantDto) {
    await this.findById(id, tenantId);
    const tenant = await this.propertyTenantRepository.update(id, dto as any);
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async remove(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    return this.propertyTenantRepository.delete(id);
  }

  async getStats(tenantId: string) {
    const [total, active] = await Promise.all([
      this.propertyTenantRepository.countBySystemTenant(tenantId),
      this.propertyTenantRepository.countActive(tenantId),
    ]);
    return { total, active, inactive: total - active };
  }
}
