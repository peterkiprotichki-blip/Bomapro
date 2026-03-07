import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertiesService } from '../../../shared/services/properties/properties.service';
import { ThemeService } from '../../../shared/services/theme/theme.service';
import { Property } from '../../../shared/interfaces/models';

@Component({
  selector: 'app-property-form',
  templateUrl: './property-form.component.html',
  styleUrls: ['./property-form.component.scss'],
})
export class PropertyFormComponent implements OnInit {
  isEdit = false;
  propertyId = '';
  loading = false;
  saving = false;
  error = '';

  form: Partial<Property> = {
    name: '', description: '', type: 'apartment', status: 'available',
    address: '', city: '', county: '', rentAmount: 0, depositAmount: 0,
    currency: 'KES', bedrooms: 1, bathrooms: 1, squareFootage: 0,
    amenities: [], unitNumber: '', floor: 0, buildingName: '',
  };

  typeOptions = ['apartment', 'house', 'commercial', 'land', 'bedsitter', 'single_room', 'one_bedroom', 'two_bedroom', 'three_bedroom'];
  statusOptions = ['available', 'occupied', 'maintenance', 'unavailable'];
  newAmenity = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertiesService: PropertiesService,
    public themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.propertyId = id;
      this.loading = true;
      this.propertiesService.getById(id).subscribe({
        next: (prop) => { Object.assign(this.form, prop); this.loading = false; },
        error: () => { this.loading = false; this.router.navigate(['/properties']); },
      });
    }
  }

  addAmenity(): void {
    if (this.newAmenity.trim()) {
      if (!this.form.amenities) this.form.amenities = [];
      this.form.amenities.push(this.newAmenity.trim());
      this.newAmenity = '';
    }
  }

  removeAmenity(i: number): void {
    this.form.amenities?.splice(i, 1);
  }

  save(): void {
    if (!this.form.name) { this.error = 'Name is required'; return; }
    this.saving = true;
    this.error = '';

    const obs = this.isEdit
      ? this.propertiesService.update(this.propertyId, this.form)
      : this.propertiesService.create(this.form);

    obs.subscribe({
      next: (prop) => {
        this.saving = false;
        this.router.navigate(['/properties', prop._id]);
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.message || 'Failed to save';
      },
    });
  }
}
