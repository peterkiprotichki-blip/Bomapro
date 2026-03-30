import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { Payment, PaymentMethod, PaymentType } from '../../../shared/interfaces/models';
import { CreatePaymentDto } from '../../../shared/interfaces/payment.interface';
import { Lease } from '../../../shared/interfaces/models';
import { PaymentsService } from '../../../shared/services/payments/payments.service';
import { ThemeService } from '../../../shared/services/theme/theme.service';

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  animations: [
    trigger('fadeIn', [transition(':enter', [style({ opacity: 0 }), animate('300ms ease-in', style({ opacity: 1 }))])]),
    trigger('slideDown', [transition(':enter', [style({ transform: 'translateY(-20px)', opacity: 0 }), animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))])]),
  ],
})
export class PaymentFormComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() lease: Lease | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Payment>();

  form: Partial<CreatePaymentDto> = this.initializeForm();
  loading = false;
  saving = false;
  submitted = false;

  paymentMethods: PaymentMethod[] = ['mpesa', 'bank_transfer', 'cash', 'cheque', 'card', 'other'];
  paymentTypes: PaymentType[] = ['rent', 'deposit', 'late_fee', 'damage', 'utility', 'other'];

  constructor(
    private paymentsService: PaymentsService,
    public themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue && this.lease) {
      this.loadLeaseData();
    }
  }

  initializeForm(): Partial<CreatePaymentDto> {
    return {
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'mpesa',
      paymentType: 'rent',
      currency: 'KES',
    };
  }

  loadLeaseData(): void {
    if (!this.lease) return;

    this.form = {
      leaseId: this.lease._id,
      propertyTenantId: this.lease.propertyTenantId,
      propertyId: this.lease.propertyId,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'mpesa',
      paymentType: 'rent',
      currency: this.lease.currency || 'KES',
      propertyName: this.lease.propertyName,
      propertyTenantName: this.lease.propertyTenantName,
    };
    this.submitted = false;
  }

  closeModal(): void {
    this.close.emit();
  }

  onSubmit(): void {
    this.submitted = true;

    if (!this.validateForm()) return;

    this.saving = true;
    this.paymentsService.create(this.form as CreatePaymentDto).subscribe({
      next: (payment) => {
        this.saving = false;
        this.save.emit(payment);
        this.closeModal();
        this.form = this.initializeForm();
      },
      error: () => {
        this.saving = false;
      },
    });
  }

  validateForm(): boolean {
    if (!this.form.leaseId) return false;
    if (!this.form.propertyTenantId) return false;
    if (!this.form.propertyId) return false;
    if (!this.form.amount || this.form.amount <= 0) return false;
    if (!this.form.paymentDate) return false;
    if (!this.form.paymentMethod) return false;
    
    // Conditional validations for specific payment methods
    if (this.form.paymentMethod === 'mpesa' && !this.form.mpesaPhoneNumber) return false;
    if (this.form.paymentMethod === 'bank_transfer' && !this.form.bankReference) return false;
    if (this.form.paymentMethod === 'cheque' && !this.form.chequeNumber) return false;
    
    return true;
  }

  getLeaseRentAmount(): number {
    return this.lease?.rentAmount || 0;
  }

  getTotalOutstanding(): number {
    if (!this.lease) return 0;
    // This would be calculated based on payment history
    return this.lease.rentAmount || 0;
  }
}
