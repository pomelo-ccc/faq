
import { Injectable, signal } from '@angular/core';

export interface User {
    name: string;
    role: 'admin' | 'guest';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    // Signal for reactive UI updates
    currentUser = signal<User | null>(null);
    isAdmin = signal(false);

    login(password: string): boolean {
        if (password === 'admin') {
            const user: User = { name: 'Admin User', role: 'admin' };
            this.currentUser.set(user);
            this.isAdmin.set(true);
            return true;
        }
        return false;
    }

    logout() {
        this.currentUser.set(null);
        this.isAdmin.set(false);
    }
}
