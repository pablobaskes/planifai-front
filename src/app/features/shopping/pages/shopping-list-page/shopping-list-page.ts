import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { Diet } from '../../../diet/models/diet.model';
import { DietService } from '../../../diet/services/diet.service';
import { ShoppingList, ShoppingListItem } from '../../models/shopping-list.model';
import { ShoppingListService } from '../../services/shopping-list.service';

@Component({
  selector: 'app-shopping-list-page',
  imports: [CommonModule],
  templateUrl: './shopping-list-page.html',
  styleUrl: './shopping-list-page.css',
})
export class ShoppingListPage implements OnInit {

  private readonly shoppingListService = inject(ShoppingListService);
  private readonly dietService = inject(DietService);

  protected readonly diets = signal<Diet[]>([]);
  protected readonly selectedDietId = signal<number | null>(null);
  protected readonly list = signal<ShoppingList | null>(null);
  protected readonly loading = signal(false);
  protected readonly loadingDiets = signal(false);
  protected readonly generating = signal(false);
  protected readonly purchasingAll = signal(false);
  protected readonly purchasingItemId = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadDiets();
    this.loadCurrent();
  }

  protected loadDiets(): void {
    const from = this.formatDate(new Date());
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 6);
    const to = this.formatDate(toDate);

    this.loadingDiets.set(true);

    this.dietService.getDietsByDateRange(from, to)
      .pipe(finalize(() => this.loadingDiets.set(false)))
      .subscribe({
        next: diets => this.diets.set(diets),
        error: error => this.error.set(this.resolveError(error)),
      });
  }

  protected loadCurrent(): void {
    this.loading.set(true);
    this.error.set(null);

    this.shoppingListService.getCurrent()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: list => this.list.set(list),
        error: error => {
          this.list.set(null);
          this.error.set(this.resolveError(error));
        },
      });
  }

  protected generateCurrent(): void {
    const dietId = this.selectedDietId();
    if (dietId === null) {
      this.error.set('Selecciona una dieta para generar la lista de la compra.');
      return;
    }

    this.generating.set(true);
    this.error.set(null);

    this.shoppingListService.generateCurrent(dietId)
      .pipe(finalize(() => this.generating.set(false)))
      .subscribe({
        next: list => this.list.set(list),
        error: error => this.error.set(this.resolveError(error)),
      });
  }

  protected purchaseItem(item: ShoppingListItem): void {
    this.purchasingItemId.set(item.id);
    this.error.set(null);

    this.shoppingListService.purchaseItem(item.id)
      .pipe(finalize(() => this.purchasingItemId.set(null)))
      .subscribe({
        next: list => this.list.set(list),
        error: error => this.error.set(this.resolveError(error)),
      });
  }

  protected purchaseAll(): void {
    this.purchasingAll.set(true);
    this.error.set(null);

    this.shoppingListService.purchaseAll()
      .pipe(finalize(() => this.purchasingAll.set(false)))
      .subscribe({
        next: list => this.list.set(list),
        error: error => this.error.set(this.resolveError(error)),
      });
  }

  protected hasPendingItems(list: ShoppingList): boolean {
    return list.items.some(item => !item.purchased);
  }

  protected trackById(_index: number, item: ShoppingListItem): number {
    return item.id;
  }

  protected selectDiet(value: string): void {
    this.selectedDietId.set(value ? Number(value) : null);
  }

  protected trackDietById(_index: number, diet: Diet): number {
    return diet.id;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private resolveError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim().length > 0) {
        return error.error;
      }

      if (error.error && typeof error.error.message === 'string') {
        return error.error.message;
      }

      if (error.status === 404) {
        return 'No hay lista de la compra actual.';
      }

      if (error.status === 409) {
        return 'La lista no se puede actualizar en su estado actual.';
      }
    }

    return 'No se pudo completar la operacion.';
  }
}
