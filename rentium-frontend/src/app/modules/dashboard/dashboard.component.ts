import { Component, OnInit } from '@angular/core';
import { ReportsService } from '../../shared/services/reports/reports.service';
import { ThemeService } from '../../shared/services/theme/theme.service';
import { DashboardStats } from '../../shared/interfaces/models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;

  constructor(
    private reportsService: ReportsService,
    public themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.reportsService.getDashboard().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
