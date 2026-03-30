import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Payment } from '../../../shared/interfaces/models';
import { PaymentsService } from '../../../shared/services/payments/payments.service';
import { ThemeService } from '../../../shared/services/theme/theme.service';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class PaymentHistoryComponent implements OnInit {
  @Input() leaseId: string = '';

  payments: Payment[] = [];
  loading = true;
  totalPaid = 0;
  outstandingBalance = 0;

  constructor(
    private paymentsService: PaymentsService,
    public themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    if (this.leaseId) {
      this.loadPaymentHistory();
    }
  }

  loadPaymentHistory(): void {
    this.loading = true;
    this.paymentsService.getByLease(this.leaseId).subscribe({
      next: (payments) => {
        this.payments = payments.filter(p => p.status === 'completed').sort((a, b) => 
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
        );
        this.totalPaid = this.payments.reduce((sum, p) => sum + p.amount, 0);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      pending: 'fa-hourglass-half',
      completed: 'fa-check-circle',
      failed: 'fa-times-circle',
      refunded: 'fa-undo',
    };
    return icons[status] || 'fa-circle';
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'text-yellow-600',
      completed: 'text-green-600',
      failed: 'text-red-600',
      refunded: 'text-purple-600',
    };
    return colors[status] || 'text-gray-600';
  }

  getPaymentMethodIcon(method: string): string {
    const icons: Record<string, string> = {
      mpesa: 'fa-mobile-alt',
      bank_transfer: 'fa-university',
      cash: 'fa-money-bill',
      cheque: 'fa-file',
      card: 'fa-credit-card',
      other: 'fa-exchange-alt',
    };
    return icons[method] || 'fa-exchange-alt';
  }
}
