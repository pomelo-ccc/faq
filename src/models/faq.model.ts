export interface FaqItem {
  id: string;
  title: string;
  component: 'Form' | 'Table' | 'Project' | 'Backend';
  version: string;
  // severity removed
  tags: string[];
  errorCode?: string;
  summary: string;
  phenomenon: string;
  solution: string;
  troubleshootingFlow: string; // Mermaid syntax
  validationMethod: string;
  views: number;
  solveTimeMinutes: number;
}