import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeasesService } from '../../../shared/services/leases/leases.service';
import { PropertiesService } from '../../../shared/services/properties/properties.service';
import { PropertyTenantsService } from '../../../shared/services/property-tenants/property-tenants.service';
import { UnitsService } from '../../../shared/services/units/units.service';
import { PaymentsService } from '../../../shared/services/payments/payments.service';
import { ThemeService } from '../../../shared/services/theme/theme.service';
import { Lease, Payment } from '../../../shared/interfaces/models';
import { PaymentFormComponent } from '../../payments/payment-form/payment-form.component';
import { PaymentHistoryComponent } from '../../payments/payment-history/payment-history.component';

interface DelinquentPayment {
  dueDate: Date;
  overdue: boolean;
  daysOverdue: number;
}

@Component({
  selector: 'app-lease-detail',
  templateUrl: './lease-detail.component.html',
  styleUrls: ['./lease-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaymentFormComponent, PaymentHistoryComponent],
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
  showPaymentForm = false;
  showEditLease = false;
  editForm: Partial<Lease> = {};
  showDocuments = false;
  delinquentPayments: DelinquentPayment[] = [];
  paymentMetrics: any = {
    totalCollected: 0,
    totalExpected: 0,
    collectionRate: 0,
    overdueAmount: 0,
    lastPaymentDate: null
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private leasesService: LeasesService,
    private propertiesService: PropertiesService,
    private propertyTenantsService: PropertyTenantsService,
    private unitsService: UnitsService,
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
        this.editForm = { ...l };
        this.calculateNextPaymentDue();
        this.generatePaymentSchedule();
        this.generateLeaseTimeline();
        this.loading = false;
        this.paymentsService.getByLease(id).subscribe((p) => {
          this.payments = p || [];
          this.calculatePaymentMetrics();
          this.identifyDelinquentPayments();
        });
        
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
        
        // Load unit number
        if (this.lease.unitId) {
          this.unitsService.getById(this.lease.unitId).subscribe({
            next: (unit) => {
              if (this.lease) {
                this.lease.unitNumber = unit.unitNumber;
              }
            },
            error: (err) => console.error('Error loading unit:', err),
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

    const timelineEvents = [
      {
        date: this.lease.createdAt,
        event: 'Lease Created',
        icon: 'fa-file-contract',
        status: 'completed',
        type: 'lease'
      },
      {
        date: this.lease.startDate,
        event: 'Lease Starts',
        icon: 'fa-play-circle',
        status: new Date() >= new Date(this.lease.startDate || '') ? 'completed' : 'pending',
        type: 'lease'
      },
      {
        date: this.lease.endDate,
        event: 'Lease Ends',
        icon: 'fa-stop-circle',
        status: new Date() >= new Date(this.lease.endDate || '') ? 'completed' : 'pending',
        type: 'lease'
      },
      ...(this.lease.terminatedAt ? [{
        date: this.lease.terminatedAt,
        event: `Terminated - ${this.lease.terminationReason || 'No reason specified'}`,
        icon: 'fa-times-circle',
        status: 'completed',
        type: 'lease'
      }] : []),
      // Add payment milestones
      ...(this.payments && this.payments.length > 0 ? 
        this.payments.slice(0, 5).map(p => ({
          date: p.paymentDate,
          event: `Payment Received - ${this.lease?.currency} ${p.amount}`,
          icon: 'fa-check-circle',
          status: p.status === 'completed' ? 'completed' : 'pending',
          type: 'payment'
        })) : [])
    ].sort((a, b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime());

    this.leaseTimeline = timelineEvents;
  }

  renewLease(): void {
    if (!this.lease || !this.lease.endDate || !confirm('Create renewal lease?')) return;

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
    if (!this.lease || !this.lease.endDate) return -1;
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

  openPaymentForm(): void {
    this.showPaymentForm = true;
  }

  closePaymentForm(): void {
    this.showPaymentForm = false;
  }

  onPaymentSaved(payment: Payment): void {
    if (!this.payments) {
      this.payments = [];
    }
    this.payments.unshift(payment);
    alert('Payment recorded successfully!');
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

  openEditLease(): void {
    this.editForm = { ...this.lease };
    this.showEditLease = true;
  }

  closeEditLease(): void {
    this.showEditLease = false;
  }

  saveLease(): void {
    if (!this.lease) return;
    this.leasesService.update(this.lease._id, this.editForm).subscribe({
      next: (updated) => {
        this.lease = updated;
        this.editForm = { ...updated };
        this.showEditLease = false;
        alert('Lease updated successfully!');
      },
      error: () => alert('Failed to update lease'),
    });
  }

  calculatePaymentMetrics(): void {
    if (!this.lease || !this.payments) return;

    const completedPayments = this.payments.filter(p => p.status === 'completed');
    this.paymentMetrics.totalCollected = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Calculate expected payments based on lease duration and frequency
    const today = new Date();
    const start = new Date(this.lease.startDate || '');
    const end = new Date(Math.min(today.getTime(), new Date(this.lease.endDate || '').getTime()));

    let monthsDuration = 0;
    let d = new Date(start);
    while (d < end) {
      monthsDuration++;
      d.setMonth(d.getMonth() + 1);
    }

    const frequency = this.lease.paymentFrequency === 'monthly' ? 1 :
                     this.lease.paymentFrequency === 'quarterly' ? 3 :
                     this.lease.paymentFrequency === 'semi_annually' ? 6 : 12;

    this.paymentMetrics.totalExpected = Math.floor(monthsDuration / frequency) * this.lease.rentAmount;
    this.paymentMetrics.collectionRate = this.paymentMetrics.totalExpected > 0 
      ? ((this.paymentMetrics.totalCollected / this.paymentMetrics.totalExpected) * 100).toFixed(1)
      : 0;

    if (completedPayments.length > 0) {
      this.paymentMetrics.lastPaymentDate = completedPayments[0].paymentDate;
    }
  }

  identifyDelinquentPayments(): void {
    const today = new Date();
    const gracePeriodMs = (this.lease?.gracePeriodDays || 5) * 24 * 60 * 60 * 1000;

    this.delinquentPayments = this.paymentSchedule
      .map(dueDate => ({
        dueDate,
        overdue: (today.getTime() - new Date(dueDate).getTime()) > gracePeriodMs,
        daysOverdue: Math.floor((today.getTime() - (new Date(dueDate).getTime() + gracePeriodMs)) / (24 * 60 * 60 * 1000))
      }))
      .filter(item => item.overdue && item.daysOverdue > 0);

    // Calculate total overdue amount
    this.paymentMetrics.overdueAmount = this.delinquentPayments.length * (this.lease?.rentAmount || 0);
  }

  downloadLeaseExport(): void {
    if (!this.lease) return;

    const summary = `
LEASE SUMMARY
=============
Lease Number: ${this.lease.leaseNumber}
Status: ${this.lease.status}

PARTIES
Property: ${this.lease.propertyName}
Tenant: ${this.lease.propertyTenantName}
Unit: ${this.lease.unitNumber}

LEASE TERMS
Start Date: ${new Date(this.lease.startDate || '').toLocaleDateString()}
End Date: ${new Date(this.lease.endDate || '').toLocaleDateString()}
Duration: ${this.getDaysUntilExpiry() > 0 ? 'Active' : 'Expired'}

FINANCIAL DETAILS
Monthly Rent: ${this.lease.currency} ${(this.lease.rentAmount || 0).toLocaleString()}
Deposit Amount: ${this.lease.currency} ${(this.lease.depositAmount || 0).toLocaleString()}
Deposit Paid: ${this.lease.depositPaid ? 'Yes' : 'No'}
Payment Frequency: ${this.lease.paymentFrequency}
Payment Due Day: ${this.lease.paymentDueDay}
Late Fee: ${this.lease.currency} ${(this.lease.lateFeeAmount || 0).toLocaleString()}
Grace Period: ${this.lease.gracePeriodDays} days

PAYMENT METRICS
Total Collected: ${this.lease.currency} ${this.paymentMetrics.totalCollected.toLocaleString()}
Total Expected: ${this.lease.currency} ${this.paymentMetrics.totalExpected.toLocaleString()}
Collection Rate: ${this.paymentMetrics.collectionRate}%
Overdue Amount: ${this.lease.currency} ${this.paymentMetrics.overdueAmount.toLocaleString()}
Total Payments: ${this.payments.length}

${this.lease.terms ? `\nTERMS\n${this.lease.terms}` : ''}

Generated: ${new Date().toLocaleString()}
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(summary));
    element.setAttribute('download', `Lease_${this.lease.leaseNumber}_Summary.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}
