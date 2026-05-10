import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize, forkJoin, of } from 'rxjs';

import { FoodService } from '../../../diet/services/food.service';
import {
  InventoryItem,
  InventoryItemRequest,
  MeasureUnit,
  StorageLocation,
} from '../../models/inventory-item.model';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-inventory-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventory-page.html',
  styleUrl: './inventory-page.css',
})
export class InventoryPage implements OnInit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly inventoryService = inject(InventoryService);
  private readonly foodService = inject(FoodService);

  protected readonly locations: StorageLocation[] = ['PANTRY', 'FRIDGE', 'FREEZER', 'OTHER'];
  protected readonly units: MeasureUnit[] = ['G', 'KG', 'ML', 'L', 'UNIT', 'TBSP', 'TSP', 'CUP'];

  protected readonly items = signal<InventoryItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly selectedLocation = signal<StorageLocation | ''>('');
  protected readonly editingId = signal<number | null>(null);
  protected readonly foodNames = signal<Map<number, string>>(new Map());

  protected readonly inventoryForm = this.formBuilder.group({
    foodId: [null as number | null, [Validators.required, Validators.min(1)]],
    quantity: [null as number | null, [Validators.required, Validators.min(0.000001)]],
    unit: ['G' as MeasureUnit, Validators.required],
    weightPerUnit: [null as number | null, Validators.min(0)],
    location: ['PANTRY' as StorageLocation, Validators.required],
  });

  ngOnInit(): void {
    this.loadInventory();
  }

  protected loadInventory(): void {
    const location = this.selectedLocation() || undefined;

    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      items: this.inventoryService.getAll(location),
      foods: this.foodService.getAllFoods().pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ items, foods }) => {
          this.items.set(items);
          this.foodNames.set(new Map(foods.map(food => [food.id, food.name])));
        },
        error: error => this.error.set(this.resolveError(error)),
      });
  }

  protected onLocationChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as StorageLocation | '';
    this.selectedLocation.set(value);
    this.loadInventory();
  }

  protected saveItem(): void {
    if (this.inventoryForm.invalid) {
      this.inventoryForm.markAllAsTouched();
      return;
    }

    const request = this.buildRequest();
    const editingId = this.editingId();
    const saveRequest = editingId === null
      ? this.inventoryService.create(request)
      : this.inventoryService.update(editingId, request);

    this.saving.set(true);
    this.error.set(null);

    saveRequest
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.resetForm();
          this.loadInventory();
        },
        error: error => this.error.set(this.resolveError(error)),
      });
  }

  protected editItem(item: InventoryItem): void {
    this.editingId.set(item.id);
    this.inventoryForm.setValue({
      foodId: item.portion.foodId,
      quantity: item.portion.quantity,
      unit: item.portion.unit,
      weightPerUnit: item.portion.weightPerUnit ?? null,
      location: item.location,
    });
  }

  protected cancelEdit(): void {
    this.resetForm();
  }

  protected deleteItem(item: InventoryItem): void {
    this.deletingId.set(item.id);
    this.error.set(null);

    this.inventoryService.delete(item.id)
      .pipe(finalize(() => this.deletingId.set(null)))
      .subscribe({
        next: () => {
          if (this.editingId() === item.id) {
            this.resetForm();
          }
          this.loadInventory();
        },
        error: error => this.error.set(this.resolveError(error)),
      });
  }

  protected isInvalid(controlName: keyof typeof this.inventoryForm.controls): boolean {
    const control = this.inventoryForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  protected trackById(_index: number, item: InventoryItem): number {
    return item.id;
  }

  protected getFoodName(item: InventoryItem): string {
    return item.portion.foodName || this.foodNames().get(item.portion.foodId) || `Food ${item.portion.foodId}`;
  }

  private buildRequest(): InventoryItemRequest {
    const formValue = this.inventoryForm.getRawValue();
    const weightPerUnit = formValue.weightPerUnit === null || formValue.weightPerUnit === undefined
      ? null
      : Number(formValue.weightPerUnit);

    return {
      portion: {
        foodId: Number(formValue.foodId),
        quantity: Number(formValue.quantity),
        unit: formValue.unit ?? 'G',
        weightPerUnit,
      },
      location: formValue.location ?? 'PANTRY',
    };
  }

  private resetForm(): void {
    this.editingId.set(null);
    this.inventoryForm.reset({
      foodId: null,
      quantity: null,
      unit: 'G',
      weightPerUnit: null,
      location: 'PANTRY',
    });
  }

  private resolveError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim().length > 0) {
        return error.error;
      }

      if (error.error && typeof error.error.message === 'string') {
        return error.error.message;
      }
    }

    return 'No se pudo completar la operacion.';
  }
}
