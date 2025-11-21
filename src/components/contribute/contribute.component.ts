import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-contribute',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contribute.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContributeComponent {
  private fb: FormBuilder = inject(FormBuilder);
  
  copied = signal(false);

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

  private formValue$ = this.faqForm.valueChanges;
  formValue = toSignal(this.formValue$);

  generatedMarkdown = computed(() => {
    const value = this.faqForm.getRawValue();
    const tagsArr = value.tags ? value.tags.split(/[,，]/).map(t => t.trim()).filter(t => t) : [];
    const formattedTags = JSON.stringify(tagsArr);
    
    let frontmatter = `---
title: "[${value.component}] ${value.title}"
component: ${value.component}
version: ${value.version}
tags: ${formattedTags}`;

    if (value.errorCode) {
      frontmatter += `\nerrorCode: ${value.errorCode}`;
    }

    frontmatter += `\n---`;

    const content = `
### 问题现象
${value.phenomenon}

### 解决方案
${value.solution}

### 排查流程
\`\`\`mermaid
${value.troubleshootingFlow}
\`\`\`

### 验证方法
${value.validationMethod}
`;

    return `${frontmatter}\n${content}`;
  });

  copyToClipboard() {
    navigator.clipboard.writeText(this.generatedMarkdown()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}