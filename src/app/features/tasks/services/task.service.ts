import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Task, TaskRequest } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {

  private readonly baseUrl = `${environment.coreApiUrl}/tasks`;

  constructor(private readonly http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.baseUrl);
  }

  createTask(request: TaskRequest): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, request);
  }
}
