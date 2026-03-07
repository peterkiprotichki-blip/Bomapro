import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PropertiesService } from '../../../shared/services/properties/properties.service';
import { ThemeService } from '../../../shared/services/theme/theme.service';
import { Property, PaginatedResponse } from '../../../shared/interfaces/models';

@Component({
  selector: 'app-properties-list',
  templateUrl: './properties-list.component.html',
  styleUrls: ['./properties-list.component.scss'],
})
export class PropertiesListComponent implements OnInit {
  properties: Property[] = [];
  loading = true;
  search = '';
  statusFilter = '';
  typeFilter = '';
  page = 1;
  limit = 20;
  total = 0;
  totalPages = 0;

  statusOptions = ['available', 'occupied', 'maintenance', 'unavailable'];
  typeOptions = ['apartment', 'house', 'commercial', 'land', 'bedsitter', 'single_room', 'one_bedroom', 'two_bedroom', 'three_bedroom'];

  constructor(
    private propertiesService: PropertiesService,
    public themeService: ThemeService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.loading = true;
    this.propertiesService.getAll(this.page, this.limit, this.search || undefined, this.statusFilter || undefined, this.typeFilter || undefined).subscribe({
      next: (res) => {
        this.properties = res.data;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  onSearch(): void {
    this.page = 1;
    this.loadProperties();
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadProperties();
  }

  goToPage(p: number): void {
    this.page = p;
    this.loadProperties();
  }

  viewProperty(id: string): void {
    this.router.navigate(['/properties', id]);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      available: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      occupied: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      maintenance: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      unavailable: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  }
}
