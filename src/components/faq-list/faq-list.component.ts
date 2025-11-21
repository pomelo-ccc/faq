import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaqService } from '../../services/faq.service';
import { FaqItem } from '../../models/faq.model';
import { FaqCardComponent } from '../faq-card/faq-card.component';

@Component({
  selector: 'app-faq-list',
  standalone: true,
  imports: [CommonModule, FaqCardComponent],
  templateUrl: './faq-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqListComponent {
  private faqService = inject(FaqService);

  allFaqs = this.faqService.getAllFaqs();
  
  searchTerm = signal('');
  errorCodeTerm = signal('');
  activeComponentTab = signal<'All' | 'Form' | 'Table' | 'Project' | 'Backend'>('All');

  readonly allTags = computed(() => {
    const tags = new Set<string>();
    this.allFaqs().forEach(faq => faq.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  });

  selectedTags = signal<Set<string>>(new Set());
  
  filteredFaqs = computed(() => {
    const faqs = this.allFaqs();
    const term = this.searchTerm().toLowerCase();
    const ecTerm = this.errorCodeTerm().toLowerCase();
    const tab = this.activeComponentTab();
    const tags = this.selectedTags();

    if (ecTerm) {
      return faqs.filter(faq => faq.errorCode?.toLowerCase().includes(ecTerm));
    }

    return faqs.filter(faq => {
      const matchesTab = tab === 'All' || faq.component === tab;
      const matchesSearch = term === '' || 
        faq.title.toLowerCase().includes(term) ||
        faq.summary.toLowerCase().includes(term);
      const matchesTags = tags.size === 0 || faq.tags.some(tag => tags.has(tag));

      return matchesTab && matchesSearch && matchesTags;
    });
  });

  onSearchTermChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    if(input.value) this.errorCodeTerm.set('');
  }

  onErrorCodeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.errorCodeTerm.set(input.value);
    if(input.value) this.searchTerm.set('');
  }

  setComponentTab(tab: 'All' | 'Form' | 'Table' | 'Project' | 'Backend') {
    this.activeComponentTab.set(tab);
  }

  toggleTag(tag: string) {
    this.selectedTags.update(currentSet => {
        const newSet = new Set(currentSet);
        if (newSet.has(tag)) {
            newSet.delete(tag);
        } else {
            newSet.add(tag);
        }
        return newSet;
    });
  }
}