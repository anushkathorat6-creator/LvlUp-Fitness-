import { ReactNode } from 'react';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import FloatingChatbot from './FloatingChatbot';

const AppLayout = ({ children }: { children: ReactNode }) => (
  <div className="bg-background min-h-screen">
    <Navbar />
    <Sidebar />
    <div className="md:ml-64">
      <div className="pt-16 pb-24 md:pb-8">
        {children}
      </div>
    </div>
    <BottomNav />
    <FloatingChatbot />
  </div>
);

export default AppLayout;