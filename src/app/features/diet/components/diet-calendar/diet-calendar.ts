import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DietDay } from '../../models/diet-day.model';
import { Diet } from '../../models/diet.model';
import { DietService } from '../../services/diet.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-diet-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diet-calendar.html',
  styleUrl: './diet-calendar.css',
})
export class DietCalendar implements OnInit{
    diet: Diet | null = null;
  weekDays: DietDay[] = [];
  mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER'] as const;
  currentWeekStart: Date = this.getMonday(new Date());
  loading = false;
  error: string | null = null;

  constructor(
    private dietService: DietService,
    private cdr: ChangeDetectorRef
) {}

  ngOnInit(): void {
    this.loadWeek();
  }

  loadWeek(): void {
    this.loading = true;
    console.log('loadWeek called, loading:', this.loading);

    const from = this.formatDate(this.currentWeekStart);
    const to = this.formatDate(this.getSunday(this.currentWeekStart));
    console.log('Fetching from:', from, 'to:', to);

    this.dietService.getDietsByDateRange(from, to).subscribe({
      next: (diets) => {
        console.log('RAW diets:', diets);
        console.log('First diet:', diets[0]);
        console.log('days:', diets[0]?.days);
        console.log('days length:', diets[0]?.days?.length);

        this.diet = diets.length > 0 ? diets[0] : null;
        this.weekDays = this.diet?.days ?? [];
        this.loading = false;
        this.cdr.detectChanges();
        console.log('loading set to false, diet:', this.diet);
        
      },
      error: (err) => {
        console.error('Error:', err);
        this.error = 'Error cargando la dieta';
        this.loading = false;
      }
    });
  }

  prevWeek(): void {
    this.currentWeekStart = new Date(
      this.currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000
    );
    this.loadWeek();
  }

  nextWeek(): void {
    this.currentWeekStart = new Date(
      this.currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000
    );
    this.loadWeek();
  }

  getRecipeForSlot(day: DietDay, mealType: string): string {
    const slot = day.mealSlots.find(s => s.type === mealType);
    return slot?.recipe?.name ?? '—';
  }

  getMealLabel(type: string): string {
    const labels: Record<string, string> = {
      BREAKFAST: '🌅 Desayuno',
      LUNCH: '☀️ Comida',
      DINNER: '🌙 Cena'
    };
    return labels[type] ?? type;
  }

  formatDateLabel(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
  }

  private getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getSunday(monday: Date): Date {
    return new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  get weekRangeLabel(): string {
    const sunday = this.getSunday(this.currentWeekStart);
    return `${this.formatDateLabel(this.formatDate(this.currentWeekStart))} — ${this.formatDateLabel(this.formatDate(sunday))}`;
  }
}
