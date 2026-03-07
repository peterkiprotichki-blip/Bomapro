import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../../shared/services/users/users.service';
import { ThemeService } from '../../../shared/services/theme/theme.service';
import { RentiumUser, PermissionsResponse, RentiumPermission } from '../../../shared/interfaces/models';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent implements OnInit {
  users: RentiumUser[] = [];
  loading = true;
  showInvite = false;
  inviting = false;
  roles = ['admin', 'manager', 'agent'];
  permissionsData: PermissionsResponse | null = null;

  inviteForm = { email: '', role: 'agent', permissions: [] as string[] };

  constructor(
    private usersService: UsersService,
    public themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.usersService.getPermissions().subscribe((p) => (this.permissionsData = p));
  }

  loadUsers(): void {
    this.loading = true;
    this.usersService.getAll().subscribe({
      next: (u) => { this.users = u; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openInvite(): void {
    this.inviteForm = { email: '', role: 'agent', permissions: [] };
    this.onRoleChange();
    this.showInvite = true;
  }

  onRoleChange(): void {
    if (this.permissionsData) {
      const defaults = this.permissionsData.defaults[this.inviteForm.role as keyof typeof this.permissionsData.defaults];
      this.inviteForm.permissions = defaults ? [...defaults] : [];
    }
  }

  togglePermission(perm: string): void {
    const idx = this.inviteForm.permissions.indexOf(perm);
    if (idx > -1) this.inviteForm.permissions.splice(idx, 1);
    else this.inviteForm.permissions.push(perm);
  }

  invite(): void {
    if (!this.inviteForm.email) return;
    this.inviting = true;
    this.usersService.invite(this.inviteForm).subscribe({
      next: () => { this.inviting = false; this.showInvite = false; this.loadUsers(); },
      error: () => { this.inviting = false; },
    });
  }

  approve(userId: string): void {
    this.usersService.approve(userId).subscribe(() => this.loadUsers());
  }

  reject(userId: string): void {
    if (!confirm('Reject this user?')) return;
    this.usersService.reject(userId).subscribe(() => this.loadUsers());
  }

  getRoleClasses(role: string): string {
    const map: Record<string, string> = {
      super_admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      agent: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };
    return map[role] || '';
  }
}
