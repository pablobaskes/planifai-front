import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { Task, TaskPriority, TaskRequest, TaskStatus } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-list-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-list-page.html',
  styleUrl: './task-list-page.css',
})
export class TaskListPage implements OnInit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly taskService = inject(TaskService);

  protected readonly statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
  protected readonly priorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

  protected readonly tasks = signal<Task[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly taskForm = this.formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(160)]],
    description: [''],
    status: ['TODO' as TaskStatus, Validators.required],
    priority: ['MEDIUM' as TaskPriority, Validators.required],
    dueDate: [''],
  });

  ngOnInit(): void {
    this.loadTasks();
  }

  protected loadTasks(): void {
    this.loading.set(true);
    this.error.set(null);

    this.taskService.getTasks()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: tasks => this.tasks.set(tasks),
        error: error => this.error.set(this.resolveError(error)),
      });
  }

  protected saveTask(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    this.taskService.createTask(this.buildRequest())
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.resetForm();
          this.loadTasks();
        },
        error: error => this.error.set(this.resolveError(error)),
      });
  }

  protected trackById(_index: number, task: Task): number {
    return task.id;
  }

  private buildRequest(): TaskRequest {
    const formValue = this.taskForm.getRawValue();

    return {
      title: formValue.title?.trim() ?? '',
      description: formValue.description?.trim() || null,
      status: formValue.status ?? 'TODO',
      priority: formValue.priority ?? 'MEDIUM',
      dueDate: formValue.dueDate || null,
    };
  }

  private resetForm(): void {
    this.taskForm.reset({
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '',
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
