import { Component } from '@angular/core';
import { DietCalendar } from "../../components/diet-calendar/diet-calendar";

@Component({
  selector: 'app-diet-calendar-page',
  templateUrl: './diet-calendar-page.html',
  styleUrl: './diet-calendar-page.css',
  imports: [DietCalendar],
})
export class DietCalendarPage {}
