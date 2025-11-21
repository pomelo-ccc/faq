
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaqItem } from '../../models/faq.model';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FaqService } from '../../services/faq.service';

@Component({
  selector: 'app-faq-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './faq-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqCardComponent {
  authService = inject(AuthService);
  private faqService = inject(FaqService);

  faqItem = input.required<FaqItem>();

  componentColorClass = computed(() => {
      switch(this.faqItem().component) {
          case 'Form': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10 border-emerald-200 dark:border-emerald-400/20';
          case 'Table': return 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-400/10 border-cyan-200 dark:border-cyan-400/20';
          case 'Project': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-400/10 border-orange-200 dark:border-orange-400/20';
          case 'Backend': return 'text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-100 dark:bg-fuchsia-400/10 border-fuchsia-200 dark:border-fuchsia-400/20';
          default: return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-400/10 border-slate-200 dark:border-slate-400/20';
      }
  });

  deleteItem(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if(confirm('确定删除该词条吗？')) {
        this.faqService.deleteFaq(this.faqItem().id).subscribe();
    }
  }
}
