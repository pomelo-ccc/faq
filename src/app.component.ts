
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  template: `
    <!-- Outer container: h-screen for fixed viewport, overflow-hidden to prevent body scroll -->
    <div class="h-screen w-full flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-300 overflow-hidden">
      
      <!-- Header: Flex-none to stay fixed size -->
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
                    <!-- Sun Icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                } @else {
                    <!-- Moon Icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                }
             </button>

            <div class="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

            <a routerLink="/" class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200" 
               [class]="isLinkActive('/') ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'">
               首页
            </a>
            <a routerLink="/contribute" class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2" 
               [class]="isLinkActive('/contribute') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
               贡献词条
            </a>
          </div>
        </nav>
      </header>

      <!-- Main: Flex-1 and overflow-y-auto to enable independent scrolling -->
      <main class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-full">
            <router-outlet></router-outlet>
        </div>

        <!-- Footer inside Main or outside? Outside to keep fixed, inside to scroll with content. 
             User asked for "Only scroll content area", usually footer is at bottom of content or fixed.
             I'll put it at the bottom of the scrollable area so it doesn't take up screen space always. -->
        <footer class="border-t border-slate-200 dark:border-slate-800 mt-auto">
            <div class="container mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p class="text-slate-500 text-sm">
                &copy; 2024 Internal Tech Support. 
                <span class="hidden md:inline mx-2 text-slate-300 dark:text-slate-700">|</span>
                <span class="text-slate-600 dark:text-slate-500">Built for speed and clarity.</span>
            </p>
            <div class="flex gap-4 text-sm text-slate-500">
                <a href="#" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Wiki</a>
                <a href="#" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">GitLab</a>
                <a href="#" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">DingTalk</a>
            </div>
            </div>
        </footer>
      </main>

    </div>
  `,
  imports: [RouterOutlet, RouterLink, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  isDark = signal(true); // Default to dark

  constructor() {
    // Initialize theme from local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        this.isDark.set(savedTheme === 'dark');
    } else {
        // Default to Dark for this specific app "Cool" aesthetic
        this.isDark.set(true);
    }

    // Apply theme class to html
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

  isLinkActive(url: string): boolean {
    return window.location.hash.endsWith(url) || (url === '/' && window.location.hash === '#/');
  }
}
