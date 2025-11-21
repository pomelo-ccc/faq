
import { Routes } from '@angular/router';
import { FaqListComponent } from './components/faq-list/faq-list.component';
import { FaqDetailComponent } from './components/faq-detail/faq-detail.component';
import { ContributeComponent } from './components/contribute/contribute.component';

export const APP_ROUTES: Routes = [
  {
    path: '',
    component: FaqListComponent,
    title: '问题速查手册 - 首页'
  },
  {
    path: 'faq/:id',
    component: FaqDetailComponent,
    title: '问题详情'
  },
  {
    path: 'contribute',
    component: ContributeComponent,
    title: '新增词条'
  },
  {
    path: 'edit/:id',
    component: ContributeComponent,
    title: '编辑词条'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
