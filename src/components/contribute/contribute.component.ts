
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FaqService } from '../../services/faq.service';
import { FaqItem } from '../../models/faq.model';

@Component({
  selector: 'app-contribute',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contribute.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContributeComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private faqService = inject(FaqService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  isEditMode = signal(false);
  isSubmitting = signal(false);
  editId = signal<string | null>(null);

  faqForm = this.fb.group({
    title: ['', Validators.required],
    component: ['Form', Validators.required],
    version: ['1.x.x', Validators.required],
    tags: ['UI, 异常, 兼容性', Validators.required],
    errorCode: [''],
    phenomenon: ['', Validators.required],
    solution: ['', Validators.required],
    troubleshootingFlow: ['graph TD\n    A[Start] --> B{Decision?};\n    B -- Yes --> C[Result 1];\n    B -- No --> D[Result 2];', Validators.required],
    validationMethod: ['', Validators.required]
  });

  ngOnInit() {
    // Check for ID in route to enable Edit Mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
        this.isEditMode.set(true);
        this.editId.set(id);
        this.faqService.getFaqById(id).subscribe(item => {
            this.faqForm.patchValue({
                title: item.title,
                component: item.component,
                version: item.version,
                tags: item.tags.join(', '),
                errorCode: item.errorCode || '',
                phenomenon: item.phenomenon,
                solution: item.solution,
                troubleshootingFlow: item.troubleshootingFlow,
                validationMethod: item.validationMethod
            });
        });
    }
  }

  onSubmit() {
    if (this.faqForm.invalid) return;
    
    this.isSubmitting.set(true);
    // Use strict typing for form value access
    const formVal = this.faqForm.getRawValue();
    
    const tagsStr = formVal.tags || '';
    const tagsArray = tagsStr.split(/[,，]/).map(t => t.trim()).filter(t => t.length > 0);

    // Construct FaqItem safely
    const payload: any = {
        ...formVal,
        tags: tagsArray,
        summary: (formVal.phenomenon || '').substring(0, 100) + '...',
        views: 0,
        solveTimeMinutes: 10
    };

    if (this.isEditMode() && this.editId()) {
        // Update
        this.faqService.updateFaq(this.editId()!, payload).subscribe({
            next: () => {
                alert('修改成功');
                this.router.navigate(['/']);
            },
            error: (err) => {
                console.error(err);
                this.isSubmitting.set(false);
            }
        });
    } else {
        // Create
        this.faqService.createFaq(payload).subscribe({
            next: () => {
                alert('发布成功');
                this.router.navigate(['/']);
            },
            error: (err) => {
                console.error(err);
                this.isSubmitting.set(false);
            }
        });
    }
  }
}
