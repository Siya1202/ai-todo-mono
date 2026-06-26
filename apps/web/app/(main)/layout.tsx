'use client';

import Sidebar from '../components/Sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <div className="l-with-sidebar">
        {children}
      </div>
    </>
  );
}
