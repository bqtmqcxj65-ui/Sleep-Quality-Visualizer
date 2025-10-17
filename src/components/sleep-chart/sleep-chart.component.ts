import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { type SleepData } from '../../models/sleep-data.model';

interface SleepMetrics {
  sleepStartPercent: number;
  sleepDurationPercent: number;
  totalDurationHours: number;
  totalDurationMinutes: number;
  disturbancePositions: number[];
}

@Component({
  selector: 'app-sleep-chart',
  templateUrl: './sleep-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class SleepChartComponent {
  data = input.required<SleepData>();

  metrics = computed<SleepMetrics>(() => {
    const sleepData = this.data();
    if (!sleepData) {
      return { sleepStartPercent: 0, sleepDurationPercent: 0, totalDurationHours: 0, totalDurationMinutes: 0, disturbancePositions: [] };
    }

    const [bedH, bedM] = sleepData.bedtime.split(':').map(Number);
    const [wakeH, wakeM] = sleepData.wakeupTime.split(':').map(Number);

    const bedtimeInMinutes = bedH * 60 + bedM;
    let wakeupTimeInMinutes = wakeH * 60 + wakeM;

    // Handle overnight sleep
    if (wakeupTimeInMinutes < bedtimeInMinutes) {
      wakeupTimeInMinutes += 24 * 60;
    }

    const totalDurationInMinutes = wakeupTimeInMinutes - bedtimeInMinutes;
    const totalDurationHours = Math.floor(totalDurationInMinutes / 60);
    const remainingMinutes = totalDurationInMinutes % 60;

    const totalDayMinutes = 24 * 60;
    const sleepStartPercent = (bedtimeInMinutes / totalDayMinutes) * 100;
    const sleepDurationPercent = (totalDurationInMinutes / totalDayMinutes) * 100;

    // Distribute disturbances evenly for visualization
    const disturbancePositions: number[] = [];
    if (sleepData.disturbances > 0 && totalDurationInMinutes > 0) {
        for (let i = 1; i <= sleepData.disturbances; i++) {
            const position = (i / (sleepData.disturbances + 1)) * 100;
            disturbancePositions.push(position);
        }
    }

    return {
      sleepStartPercent,
      sleepDurationPercent,
      totalDurationHours,
      totalDurationMinutes: remainingMinutes,
      disturbancePositions,
    };
  });
}
