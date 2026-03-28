'use client';

// App shell: sidebar + main content area
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-with-sidebar">
        {/* Mobile top bar */}
        <div className="md:hidden">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <main className="py-4 md:py-6 max-w-5xl">
          {children}
        </main>
      </div>
    </div>
  );
}
