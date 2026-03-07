import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { LeaseRepository } from './repositories/lease.repository';
import { CreateLeaseDto, UpdateLeaseDto } from './dto/lease.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LeasesService {
  constructor(private readonly leaseRepository: LeaseRepository) {}

  async create(dto: CreateLeaseDto, tenantId: string) {
    const activeLease = await this.leaseRepository.findActiveByProperty(dto.propertyId);
    if (activeLease) {
      throw new BadRequestException('Property already has an active lease');
    }

    const leaseNumber = `LS-${Date.now().toString(36).toUpperCase()}`;
    return this.leaseRepository.create({
      ...dto,
      tenantId,
      leaseNumber,
      status: 'draft',
    } as any);
  }

  async findAll(tenantId: string, page = 1, limit = 20, search?: string, status?: string) {
    const filter: any = { tenantId };
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { leaseNumber: { $regex: search, $options: 'i' } },
        { propertyName: { $regex: search, $options: 'i' } },
        { propertyTenantName: { $regex: search, $options: 'i' } },
      ];
    }
    return this.leaseRepository.findPaginated({ page, limit, filter });
  }

  async findById(id: string) {
    const lease = await this.leaseRepository.findById(id);
    if (!lease || lease.isDeleted) {
      throw new NotFoundException('Lease not found');
    }
    return lease;
  }

  async findByProperty(tenantId: string, propertyId: string) {
    return this.leaseRepository.findByProperty(tenantId, propertyId);
  }

  async findByPropertyTenant(tenantId: string, propertyTenantId: string) {
    return this.leaseRepository.findByPropertyTenant(tenantId, propertyTenantId);
  }

  async findExpiringSoon(tenantId: string, days = 30) {
    return this.leaseRepository.findExpiringSoon(tenantId, days);
  }

  async activate(id: string) {
    const lease = await this.leaseRepository.findById(id);
    if (!lease) throw new NotFoundException('Lease not found');

    const activeLease = await this.leaseRepository.findActiveByProperty(lease.propertyId);
    if (activeLease && activeLease._id.toString() !== id) {
      throw new BadRequestException('Property already has an active lease');
    }

    return this.leaseRepository.update(id, { status: 'active' } as any);
  }

  async terminate(id: string, reason: string) {
    const lease = await this.leaseRepository.findById(id);
    if (!lease) throw new NotFoundException('Lease not found');

    return this.leaseRepository.update(id, {
      status: 'terminated',
      terminatedAt: new Date(),
      terminationReason: reason,
    } as any);
  }

  async update(id: string, dto: UpdateLeaseDto) {
    const lease = await this.leaseRepository.update(id, dto as any);
    if (!lease) throw new NotFoundException('Lease not found');
    return lease;
  }

  async remove(id: string) {
    return this.leaseRepository.delete(id);
  }

  async getStats(tenantId: string) {
    const [total, active, expired, draft] = await Promise.all([
      this.leaseRepository.countByTenant(tenantId),
      this.leaseRepository.countByStatus(tenantId, 'active'),
      this.leaseRepository.countByStatus(tenantId, 'expired'),
      this.leaseRepository.countByStatus(tenantId, 'draft'),
    ]);
    const expiringSoon = await this.leaseRepository.findExpiringSoon(tenantId, 30);
    return { total, active, expired, draft, expiringSoonCount: expiringSoon.length };
  }
}
