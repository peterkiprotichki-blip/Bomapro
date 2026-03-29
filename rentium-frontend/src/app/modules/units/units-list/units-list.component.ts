import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnitsService, Unit, PaginatedResponse } from '../../../shared/services/units/units.service';
import { ThemeService } from '../../../shared/services/theme/theme.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { PropertiesService } from '../../../shared/services/properties/properties.service';
import { Property } from '../../../shared/interfaces/models';
import { UnitViewComponent } from '../unit-view/unit-view.component';
import { UnitsFormComponent } from '../units-form/units-form.component';

@Component({
  selector: 'app-units-list',
  templateUrl: './units-list.component.html',
  styleUrls: ['./units-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, UnitViewComponent, UnitsFormComponent],
})
export class UnitsListComponent implements OnInit {
  units: Unit[] = [];
  loading = true;
  search = '';
  propertyIdFilter = ''; // User-selected property filter
  urlPropertyId = ''; // URL-driven property scope
  statusFilter = '';
  unitTypeFilter = '';
  page = 1;
  limit = 20;
  total = 0;
  totalPages = 0;
  propertyMap: { [key: string]: string } = {}; // Cache property names
  propertyOptions: Pick<Property, '_id' | 'name'>[] = [];
  isTenant = false;
  propertyOptionsLoaded = false;

  statusOptions = ['vacant', 'occupied', 'maintenance', 'reserved'];
  unitTypeOptions = ['bedsitter', 'single_room', 'one_bedroom', 'two_bedroom', 'three_bedroom'];

  // Modal state
  formModalOpen = false;
  viewModalOpen = false;
  selectedUnit: Unit | null = null;

  constructor(
    private unitsService: UnitsService,
    private propertiesService: PropertiesService,
    public themeService: ThemeService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.isTenant = user?.role === 'tenant';
    
    // Load properties first, then subscribe to route params
    this.loadPropertyOptions();

    this.route.queryParams.subscribe((params) => {
      this.urlPropertyId = params['propertyId'] || '';
      this.page = 1;
      this.loadUnits();
    });
  }

  loadUnits(): void {
    this.loading = true;
    // Use URL property scope first, then fall back to user filter
    const propertyIdToSend = this.urlPropertyId || this.propertyIdFilter || undefined;
    this.unitsService
      .getAll(
        this.page,
        this.limit,
        propertyIdToSend,
        this.statusFilter || undefined,
        this.search || undefined,
        this.unitTypeFilter || undefined,
      )
      .subscribe({
        next: (res) => {
          // If tenant, filter to show only their units
          if (this.isTenant) {
            const user = this.authService.getUser();
            this.units = res.data.filter((unit: any) => {
              // Show units where the tenant has an active lease or property tenancy
              return unit.currentTenantId === user?._id;
            });
          } else {
            this.units = res.data;
          }
          this.total = this.units.length;
          this.totalPages = Math.ceil(this.total / this.limit);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  loadPropertyOptions(): void {
    this.propertiesService.getAll(1, 1000).subscribe({
      next: (res) => {
        this.propertyOptions = res.data.map((prop) => ({
          _id: prop._id,
          name: prop.name,
        }));
        this.propertyOptions.forEach((prop) => {
          this.propertyMap[prop._id || ''] = prop.name;
        });
        this.propertyOptionsLoaded = true;
      },
      error: () => {
        // Silent fail - just continue without property names
        this.propertyOptionsLoaded = true;
      },
    });
  }

  getPropertyName(propertyId: string): string {
    return this.propertyMap[propertyId] || 'Unknown Property';
  }

  getUnitTypeLabel(type: string | undefined): string {
    if (!type) return '-';
    return type
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  getFloorLabel(floor: number | string | undefined): string {
    if (floor === undefined || floor === null) return '-';
    if (floor === 'G' || floor === 0) return 'G';
    const floorNum = typeof floor === 'string' ? parseInt(floor) : floor;
    if (isNaN(floorNum)) return String(floor);
    // Add ordinal suffix
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = floorNum % 100;
    return floorNum + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  }

  onSearch(): void {
    this.page = 1;
    this.loadUnits();
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadUnits();
  }

  goToPage(p: number): void {
    this.page = p;
    this.loadUnits();
  }

  openCreateModal(): void {
    this.selectedUnit = null;
    this.formModalOpen = true;
  }

  openEditModal(unit: Unit): void {
    this.selectedUnit = unit;
    this.formModalOpen = true;
  }

  closeFormModal(): void {
    this.formModalOpen = false;
    this.selectedUnit = null;
  }

  onUnitSaved(unit: Unit): void {
    this.loadUnits();
    this.closeFormModal();
  }

  openViewModal(unit: Unit): void {
    this.selectedUnit = unit;
    this.viewModalOpen = true;
  }

  closeViewModal(): void {
    this.viewModalOpen = false;
    this.selectedUnit = null;
  }

  onUnitEdit(unit: Unit): void {
    this.closeViewModal();
    this.openEditModal(unit);
  }

  viewUnit(id: string | undefined): void {
    if (id) {
      this.router.navigate(['/units', id]);
    }
  }

  deleteUnit(id: string | undefined): void {
    if (!id) return;
    if (confirm('Are you sure you want to delete this unit?')) {
      this.unitsService.delete(id).subscribe({
        next: () => {
          this.loadUnits();
        },
        error: (err) => {
          console.error('Delete error:', err);
        },
      });
    }
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      vacant: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      occupied: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      maintenance: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      reserved: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  }
}
