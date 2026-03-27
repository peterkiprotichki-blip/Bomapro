import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeasesService } from '../../../shared/services/leases/leases.service';
import { PropertiesService } from '../../../shared/services/properties/properties.service';
import { PropertyTenantsService } from '../../../shared/services/property-tenants/property-tenants.service';
import { PaymentsService } from '../../../shared/services/payments/payments.service';
import { ThemeService } from '../../../shared/services/theme/theme.service';
import { Lease, Payment } from '../../../shared/interfaces/models';

@Component({
  selector: 'app-lease-detail',
  templateUrl: './lease-detail.component.html',
  styleUrls: ['./lease-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
})
export class LeaseDetailComponent implements OnInit {
  lease: Lease | null = null;
  payments: Payment[] = [];
  loading = true;
  showTerminate = false;
  terminationReason = '';
  nextPaymentDue: Date | null = null;
  paymentSchedule: Date[] = [];
  leaseTimeline: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private leasesService: LeasesService,
    private propertiesService: PropertiesService,
    private propertyTenantsService: PropertyTenantsService,
    private paymentsService: PaymentsService,
    public themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(id);
  }

  load(id: string): void {
    this.leasesService.getById(id).subscribe({
      next: (l) => {
        this.lease = l;
        this.calculateNextPaymentDue();
        this.generatePaymentSchedule();
        this.generateLeaseTimeline();
        this.loading = false;
        this.paymentsService.getByLease(id).subscribe((p) => (this.payments = p || []));
        
        // Load property name
        if (this.lease.propertyId) {
          this.propertiesService.getById(this.lease.propertyId).subscribe({
            next: (property) => {
              if (this.lease) {
                this.lease.propertyName = property.name;
              }
            },
            error: (err) => console.error('Error loading property:', err),
          });
        }
        
        // Load tenant name
        if (this.lease.propertyTenantId) {
          this.propertyTenantsService.getById(this.lease.propertyTenantId).subscribe({
            next: (tenant) => {
              if (this.lease) {
                this.lease.propertyTenantName = tenant.name;
              }
            },
            error: (err) => console.error('Error loading tenant:', err),
          });
        }
      },
      error: () => { this.loading = false; },
    });
  }

  calculateNextPaymentDue(): void {
    if (this.lease) {
      this.nextPaymentDue = this.leasesService.calculateNextPaymentDueDate(this.lease);
    }
  }

  generatePaymentSchedule(): void {
    if (this.lease) {
      this.paymentSchedule = this.leasesService.calculatePaymentSchedule(this.lease, 12);
    }
  }

  generateLeaseTimeline(): void {
    if (!this.lease) return;

    this.leaseTimeline = [
      {
        date: this.lease.createdAt,
        event: 'Lease Created',
        icon: 'fa-file-contract',
        status: 'completed',
      },

      {
        date: this.lease.startDate,
        event: 'Lease Starts',
        icon: 'fa-play-circle',
        status: new Date() >= new Date(this.lease.startDate) ? 'completed' : 'pending',
      },
      {
        date: this.lease.endDate,
        event: 'Lease Ends',
        icon: 'fa-stop-circle',
        status: new Date() >= new Date(this.lease.endDate) ? 'completed' : 'pending',
      },
      ...(this.lease.terminatedAt ? [{
        date: this.lease.terminatedAt,
        event: `Terminated - ${this.lease.terminationReason || 'No reason specified'}`,
        icon: 'fa-times-circle',
        status: 'completed',
      }] : []),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  renewLease(): void {
    if (!this.lease || !confirm('Create renewal lease?')) return;

    const startDate = new Date(this.lease.endDate);
    startDate.setDate(startDate.getDate() + 1);

    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const renewalData: Partial<Lease> = {
      tenantId: this.lease.tenantId,
      propertyId: this.lease.propertyId,
      unitId: this.lease.unitId,
      propertyTenantId: this.lease.propertyTenantId,
      leaseNumber: `${this.lease.leaseNumber}-RENEW`,
      status: 'draft',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      rentAmount: this.lease.rentAmount,
      currency: this.lease.currency,
      depositAmount: this.lease.depositAmount,
      depositPaid: false,
      paymentFrequency: this.lease.paymentFrequency,
      paymentDueDay: this.lease.paymentDueDay,
      terms: this.lease.terms,
      renewedFromLeaseId: this.lease._id,
      propertyTenantName: this.lease.propertyTenantName,
      propertyName: this.lease.propertyName,
    };

    this.leasesService.create(renewalData).subscribe({
      next: () => {
        alert('Renewal lease created. Activate it to begin the new term.');
        this.router.navigate(['/leases']);
      },
      error: () => alert('Failed to create renewal lease'),
    });
  }

  getDaysUntilExpiry(): number {
    if (!this.lease) return -1;
    const today = new Date();
    const end = new Date(this.lease.endDate);
    return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  isLeaseExpiring(): boolean {
    const days = this.getDaysUntilExpiry();
    return days > 0 && days <= 30;
  }

  canRenew(): boolean {
    return this.lease?.status === 'active' && this.isLeaseExpiring();
  }

  canActivate(): boolean {
    return this.lease?.status === 'draft';
  }

  canTerminate(): boolean {
    return ['active', 'draft'].includes(this.lease?.status || '');
  }

  getStatusClasses(status: string): string {
    const map: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400',
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      terminated: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      renewed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };
    return map[status] || '';
  }

  goBack(): void { this.router.navigate(['/leases']); }

  activate(): void {
    if (!this.lease) return;
    this.leasesService.activate(this.lease._id).subscribe((l) => (this.lease = l));
  }

  terminate(): void {
    if (!this.lease || !this.terminationReason) return;
    this.leasesService.terminate(this.lease._id, this.terminationReason).subscribe((l) => {
      this.lease = l;
      this.showTerminate = false;
      this.generateLeaseTimeline();
    });
  }

  deleteLease(): void {
    if (!this.lease || !confirm('Delete this lease?')) return;
    this.leasesService.delete(this.lease._id).subscribe(() => this.goBack());
  }
}
