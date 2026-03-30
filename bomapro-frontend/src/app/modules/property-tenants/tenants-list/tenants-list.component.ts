import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PropertyTenantsService } from '../../../shared/services/property-tenants/property-tenants.service';
import { ThemeService } from '../../../shared/services/theme/theme.service';
import { PropertyTenant } from '../../../shared/interfaces/models';
import { AddTenantFormComponent } from '../add-tenant-form/add-tenant-form.component';

@Component({
  selector: 'app-tenants-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AddTenantFormComponent],
  templateUrl: './tenants-list.component.html',
  styleUrls: ['./tenants-list.component.scss'],
})
export class TenantsListComponent implements OnInit {
  @ViewChild(AddTenantFormComponent) addTenantForm!: AddTenantFormComponent;

  tenants: PropertyTenant[] = [];
  loading = true;
  search = '';
  page = 1;
  limit = 20;
  total = 0;
  totalPages = 0;
  Math = Math;

  constructor(
    private tenantsService: PropertyTenantsService,
    public themeService: ThemeService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.loading = true;
    this.tenantsService.getAll(this.page, this.limit, this.search || undefined).subscribe({
      next: (res) => {
        this.tenants = res.data;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.page = 1;
    this.loadTenants();
  }

  goToPage(p: number): void {
    this.page = p;
    this.loadTenants();
  }

  openAddTenantForm(): void {
    this.addTenantForm.open();
  }

  onTenantCreated(tenant: any): void {
    this.loadTenants();
  }

  viewTenant(id: string): void {
    this.router.navigate(['/tenants', id]);
  }

  deleteTenant(id: string): void {
    if (confirm('Are you sure you want to delete this tenant?')) {
      this.tenantsService.delete(id).subscribe({
        next: () => {
          this.loadTenants();
        },
        error: (err) => {
          console.error('Error deleting tenant:', err);
        },
      });
    }
  }
}
