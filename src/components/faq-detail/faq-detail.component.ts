
import { AfterViewInit, ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { FaqService } from '../../services/faq.service';
import { FaqItem } from '../../models/faq.model';

declare global {
  interface Window {
    mermaid?: {
      run: (options?: { nodes: HTMLElement[], suppressErrors?: boolean }) => void;
    };
  }
}

@Component({
  selector: 'app-faq-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './faq-detail.component.html',
  styleUrls: ['./faq-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqDetailComponent implements AfterViewInit {
  private route = inject(ActivatedRoute);
  private faqService = inject(FaqService);

  feedbackSent = signal(false);

  private faqId = toSignal(this.route.paramMap.pipe(map(params => params.get('id'))));
  
  faqItem = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      switchMap(id => this.faqService.getFaqById(id!))
    )
  );

  constructor() {
    effect(() => {
        if(this.faqItem()) {
            setTimeout(() => this.renderMermaid());
        }
    }, { allowSignalWrites: true });
  }

  ngAfterViewInit(): void {
    this.renderMermaid();
  }

  renderMermaid() {
    if (window.mermaid) {
        try {
            window.mermaid.run();
        } catch(e) {
            console.error('Mermaid rendering failed', e);
        }
    }
  }

  sendFeedback() {
    this.feedbackSent.set(true);
  }

}
