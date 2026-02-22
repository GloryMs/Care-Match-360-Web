// src/components/layout/Layout.jsx
//
// Authenticated application shell used by AppRouter for all protected routes.
// Composes: Sidebar (collapsible on mobile) + AppNavbar + <Outlet /> (page content).

import { useState } from 'react';
import { Outlet }   from 'react-router-dom';
import Sidebar      from './Sidebar';
import AppNavbar    from './Navbar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--bg-page)' }}
    >
      {/* ── Sidebar ── */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Mobile backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main: top navbar + scrollable page ── */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <AppNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}