
import { Injectable, inject, signal } from '@angular/core';
import { FaqItem } from '../models/faq.model';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FaqService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/faqs';

  // Use a signal to hold the list for efficient state management
  private faqs = signal<FaqItem[]>([]);

  constructor() {
    this.refresh();
  }

  refresh() {
    this.http.get<FaqItem[]>(this.apiUrl).subscribe(data => {
        this.faqs.set(data);
    });
  }

  getAllFaqs() {
    return this.faqs.asReadonly();
  }

  getFaqById(id: string): Observable<FaqItem> {
    return this.http.get<FaqItem>(`${this.apiUrl}/${id}`);
  }

  createFaq(faq: FaqItem): Observable<FaqItem> {
    return this.http.post<FaqItem>(this.apiUrl, faq).pipe(
        tap(() => this.refresh())
    );
  }

  updateFaq(id: string, faq: FaqItem): Observable<FaqItem> {
    return this.http.put<FaqItem>(`${this.apiUrl}/${id}`, faq).pipe(
        tap(() => this.refresh())
    );
  }

  deleteFaq(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
        tap(() => this.refresh())
    );
  }
}
