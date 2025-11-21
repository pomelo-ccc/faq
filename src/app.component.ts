
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <!-- Outer container -->
    <div class="h-screen w-full flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-300 overflow-hidden">
      
      <!-- Header -->
      <header class="flex-none z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <nav class="container mx-auto px-6 h-16 flex justify-between items-center">
          <a routerLink="/" class="flex items-center gap-2 group">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-indigo-500/50 transition-all duration-300">
              F
            </div>
            <span class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">FAQ <span class="text-slate-500 font-normal text-sm ml-1">Internal</span></span>
          </a>
          
          <div class="flex items-center gap-3">
             <!-- Theme Toggler -->
             <button (click)="toggleTheme()" class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="切换主题">
                @if(!isDark()) {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                }
             </button>

            <div class="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

            <a routerLink="/" class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200" 
               [class]="isLinkActive('/') ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'">
               首页
            </a>
            
            @if(authService.isAdmin()) {
                <a routerLink="/contribute" class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2" 
                   [class]="isLinkActive('/contribute') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                   新增词条
                </a>
                <button (click)="authService.logout()" class="text-sm text-red-500 hover:text-red-600 font-medium">
                    退出
                </button>
            } @else {
                <button (click)="showLoginModal.set(true)" class="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                    管理员登录
                </button>
            }

          </div>
        </nav>
      </header>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-full">
            <router-outlet></router-outlet>
        </div>

        <footer class="border-t border-slate-200 dark:border-slate-800 mt-auto">
            <div class="container mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p class="text-slate-500 text-sm">
                &copy; 2024 Internal Tech Support. 
                <span class="hidden md:inline mx-2 text-slate-300 dark:text-slate-700">|</span>
                <span class="text-slate-600 dark:text-slate-500">Built for speed and clarity.</span>
            </p>
            </div>
        </footer>
      </main>

      <!-- Login Modal -->
      @if(showLoginModal()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8 border border-slate-200 dark:border-slate-700">
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">管理员登录</h2>
                <input type="password" #pwdInput (keyup.enter)="tryLogin(pwdInput.value)" placeholder="输入密码 (admin)" class="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-4">
                <div class="flex gap-3">
                    <button (click)="showLoginModal.set(false)" class="flex-1 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">取消</button>
                    <button (click)="tryLogin(pwdInput.value)" class="flex-1 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/30 transition-all">登录</button>
                </div>
            </div>
        </div>
      }

    </div>
  `,
  imports: [RouterOutlet, RouterLink, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  authService = inject(AuthService);
  isDark = signal(true);
  showLoginModal = signal(false);

  constructor() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        this.isDark.set(savedTheme === 'dark');
    } else {
        this.isDark.set(true);
    }

    effect(() => {
        if (this.isDark()) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', this.isDark() ? 'dark' : 'light');
    });
  }

  toggleTheme() {
    this.isDark.update(d => !d);
  }

  tryLogin(pwd: string) {
    if (this.authService.login(pwd)) {
        this.showLoginModal.set(false);
    } else {
        alert('密码错误 (提示: admin)');
    }
  }

  isLinkActive(url: string): boolean {
    return window.location.hash.endsWith(url) || (url === '/' && window.location.hash === '#/');
  }
}
