import { ChangeDetectionStrategy, Component, computed, inject, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from './services/gemini.service';
import { type SleepData } from './models/sleep-data.model';
import { SleepChartComponent } from './components/sleep-chart/sleep-chart.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, SleepChartComponent]
})
export class AppComponent {
  private readonly geminiService = inject(GeminiService);

  bedtime = model('22:30');
  wakeupTime = model('06:30');
  disturbances = model(2);

  isLoading = signal(false);
  analysis = signal('');
  error = signal('');
  submittedData = signal<SleepData | null>(null);

  isFormValid = computed(() => {
    return this.bedtime() && this.wakeupTime() && this.disturbances() >= 0;
  });

  async analyzeSleep() {
    if (!this.isFormValid()) {
      this.error.set('Please fill out all fields correctly.');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');
    this.analysis.set('');
    this.submittedData.set(null);

    const sleepData: SleepData = {
      bedtime: this.bedtime(),
      wakeupTime: this.wakeupTime(),
      disturbances: this.disturbances(),
    };

    try {
      const result = await this.geminiService.analyzeSleepData(sleepData);
      this.analysis.set(result);
      this.submittedData.set(sleepData);
    } catch (e) {
      console.error(e);
      this.error.set('Failed to get sleep analysis. Please check your API key and try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Helper to parse markdown-like text from Gemini into HTML
  formatAnalysis(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\n/g, '<br>'); // Newlines
  }
}
