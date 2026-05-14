import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { Diet, DietRequest } from '../../models/diet.model';
import { DietService } from '../../services/diet.service';

@Component({
  selector: 'app-diet-create-page',
  imports: [ReactiveFormsModule],
  templateUrl: './diet-create-page.html',
  styleUrl: './diet-create-page.css',
})
export class DietCreatePage implements OnInit {

  private readonly dietService = inject(DietService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly saving = signal(false);
  protected readonly loading = signal(false);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly listError = signal<string | null>(null);
  protected readonly diets = signal<Diet[]>([]);

  protected readonly dietForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: [''],
    initDate: ['', Validators.required],
    endDate: ['', Validators.required],
    caloriesTarget: [2000, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.loadDiets();
  }

  protected loadDiets(): void {
    this.loading.set(true);
    this.listError.set(null);

    this.dietService.getAllDiets()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: diets => this.diets.set(diets),
        error: error => this.listError.set(this.resolveError(error, 'No se pudieron cargar las dietas.')),
      });
  }

  protected submit(): void {
    if (this.dietForm.invalid) {
      this.dietForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    this.dietService.createDiet(this.buildRequest())
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.dietForm.reset({
            name: '',
            description: '',
            initDate: '',
            endDate: '',
            caloriesTarget: 2000,
          });
          this.loadDiets();
        },
        error: error => this.error.set(this.resolveError(error, 'No se pudo crear la dieta.')),
      });
  }

  protected deleteDiet(diet: Diet): void {
    this.deletingId.set(diet.id);
    this.listError.set(null);

    this.dietService.deleteDiet(diet.id)
      .pipe(finalize(() => this.deletingId.set(null)))
      .subscribe({
        next: () => this.loadDiets(),
        error: error => this.listError.set(this.resolveError(error, 'No se pudo eliminar la dieta.')),
      });
  }

  protected isInvalid(controlName: keyof typeof this.dietForm.controls): boolean {
    const control = this.dietForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  private buildRequest(): DietRequest {
    const formValue = this.dietForm.getRawValue();
    const description = formValue.description?.trim();

    return {
      name: formValue.name?.trim() ?? '',
      description: description || undefined,
      initDate: formValue.initDate ?? '',
      endDate: formValue.endDate ?? '',
      caloriesTarget: Number(formValue.caloriesTarget),
    };
  }

  private resolveError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim().length > 0) {
        return error.error;
      }

      if (error.error && typeof error.error.message === 'string') {
        return error.error.message;
      }

      if (error.status === 409) {
        return 'Ya existe una dieta activa que se solapa con ese rango de fechas. Elimina la dieta anterior antes de crear otra.';
      }
    }

    return fallback;
  }
}
