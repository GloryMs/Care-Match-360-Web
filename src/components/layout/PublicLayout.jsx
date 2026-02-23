// src/components/layout/PublicLayout.jsx
//
// Wrapper for public routes in AppRouter.
// Auth pages (Login, Register, etc.) already include their own AuthLayout,
// so this just renders <Outlet /> transparently.
// The landing page renders its own full-page layout.

import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return <Outlet />;
}