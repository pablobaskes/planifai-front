import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

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

  protected readonly list = signal<ShoppingList | null>(null);
  protected readonly loading = signal(false);
  protected readonly generating = signal(false);
  protected readonly purchasingAll = signal(false);
  protected readonly purchasingItemId = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCurrent();
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
    this.generating.set(true);
    this.error.set(null);

    this.shoppingListService.generateCurrent()
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
