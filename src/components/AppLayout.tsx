import { ReactNode } from 'react';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

const AppLayout = ({ children }: { children: ReactNode }) => (
  <div className="mesh-bg min-h-screen">
    <Sidebar />
    <div className="md:ml-64">
      <div className="pb-24 md:pb-8">
        {children}
      </div>
    </div>
    <BottomNav />
  </div>
);

export default AppLayout;