import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { DietRequest } from '../../models/diet.model';
import { DietService } from '../../services/diet.service';

@Component({
  selector: 'app-diet-create-page',
  imports: [ReactiveFormsModule],
  templateUrl: './diet-create-page.html',
  styleUrl: './diet-create-page.css',
})
export class DietCreatePage {

  private readonly dietService = inject(DietService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly dietForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: [''],
    initDate: ['', Validators.required],
    endDate: ['', Validators.required],
    caloriesTarget: [2000, [Validators.required, Validators.min(1)]],
  });

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
          void this.router.navigate(['/diet/calendar']);
        },
        error: error => this.error.set(this.resolveError(error)),
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

  private resolveError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim().length > 0) {
        return error.error;
      }

      if (error.error && typeof error.error.message === 'string') {
        return error.error.message;
      }
    }

    return 'No se pudo crear la dieta.';
  }
}
