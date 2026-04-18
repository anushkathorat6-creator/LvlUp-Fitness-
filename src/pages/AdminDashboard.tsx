import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, BarChart3, Settings, Layers, LayoutDashboard, Search, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'levels', label: 'Levels', icon: Layers },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const logout = useAuthStore(s => s.logout);
  const [appName, setAppName] = useState('LevelFit AI');
  const [maintenance, setMaintenance] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userFilter, setUserFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { label: 'Total Users', value: 0 },
    { label: 'Active Today', value: 0 },
    { label: 'Workouts Logged', value: 0 },
    { label: 'Avg Level', value: 1 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen mesh-bg theme-admin">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 h-screen fixed left-0 top-0 glass-strong border-r border-white/20 p-6 flex flex-col z-40">
          <h2 className="font-display text-xl font-bold text-foreground mb-8">Admin Panel</h2>
          <nav className="flex-1 space-y-1">
            {tabs.map(t => (
              <motion.button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm font-medium transition-all ${activeTab === t.id ? 'gradient-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground'}`}
              >
                <t.icon className="w-5 h-5" />{t.label}
              </motion.button>
            ))}
          </nav>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all text-sm"
          >
            <LogOut className="w-5 h-5" /> Logout
          </motion.button>
        </aside>

        {/* Content */}
        <main className="ml-64 flex-1 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === 'overview' && (
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground mb-6">Overview</h1>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {stats.map(s => (
                      <motion.div key={s.label} whileHover={{ y: -2 }} className="glass rounded-2xl p-5 text-center card-hover">
                        <p className="text-2xl font-bold text-foreground">{s.value}</p>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="glass rounded-2xl p-5 mb-6">
                    <h3 className="font-display font-semibold mb-4">User Signups</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={[]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip />
                        <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                    <p className="text-center text-sm text-muted-foreground mt-2">No signup data yet</p>
                  </div>
                  <div className="glass rounded-2xl p-5">
                    <h3 className="font-display font-semibold mb-4">Recent Activity</h3>
                    <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">No activity yet</div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground mb-6">Users</h1>
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="SEARCH USERS..."
                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-neon-green focus:ring-4 focus:ring-neon-green/10 outline-none text-sm font-black text-white uppercase tracking-widest placeholder:text-white/20 transition-all"
                      />
                    </div>
                    <div className="flex bg-muted rounded-full p-0.5">
                      {['All', 'Active', 'Inactive'].map(f => (
                        <button
                          key={f}
                          onClick={() => { setUserFilter(f); toast(`Filter: ${f}`, { icon: '🔍' }); }}
                          className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${userFilter === f ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="glass rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-4 text-muted-foreground font-medium">Name</th>
                          <th className="text-left p-4 text-muted-foreground font-medium">Email</th>
                          <th className="text-left p-4 text-muted-foreground font-medium">Level</th>
                          <th className="text-left p-4 text-muted-foreground font-medium">Days</th>
                          <th className="text-left p-4 text-muted-foreground font-medium">Joined</th>
                          <th className="text-left p-4 text-muted-foreground font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={6} className="text-center p-8 text-muted-foreground">
                            <div className="flex flex-col items-center gap-2">
                              <Users className="w-8 h-8 opacity-30" />
                              <p>No users yet</p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'levels' && (
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground mb-6">Levels</h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 21 }, (_, i) => (
                      <motion.div key={i} whileHover={{ y: -3, scale: 1.02 }} className="glass rounded-2xl p-5 card-hover">
                        <h3 className="font-bold text-foreground">Level {i + 1}</h3>
                        <p className="text-xs text-muted-foreground mb-1">5 Days · Active</p>
                        <p className="text-xs text-muted-foreground mb-3">{(i + 1) * 5} total exercises</p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toast(`Level ${i + 1} editing coming soon!`, { icon: '🔧' })}
                          className="text-xs text-primary font-medium px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                        >
                          Edit
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground mb-6">Analytics</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass rounded-2xl p-5">
                      <h3 className="font-display font-semibold mb-3 text-sm">User Growth (Line)</h3>
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={[]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                      <p className="text-center text-xs text-muted-foreground mt-1">No data yet</p>
                    </div>

                    <div className="glass rounded-2xl p-5">
                      <h3 className="font-display font-semibold mb-3 text-sm">Workouts per Day (Bar)</h3>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={[]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                          <Tooltip />
                          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                      <p className="text-center text-xs text-muted-foreground mt-1">No data yet</p>
                    </div>

                    <div className="glass rounded-2xl p-5">
                      <h3 className="font-display font-semibold mb-3 text-sm">Calories Trend (Area)</h3>
                      <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={[]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                          <Tooltip />
                          <Area type="monotone" dataKey="calories" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                        </AreaChart>
                      </ResponsiveContainer>
                      <p className="text-center text-xs text-muted-foreground mt-1">No data yet</p>
                    </div>

                    <div className="glass rounded-2xl p-5">
                      <h3 className="font-display font-semibold mb-3 text-sm">Completion Rate (Radial)</h3>
                      <ResponsiveContainer width="100%" height={180}>
                        <RadialBarChart innerRadius="60%" outerRadius="90%" data={[{ name: 'Complete', value: 0, fill: 'hsl(var(--primary))' }]} startAngle={90} endAngle={-270}>
                          <RadialBar dataKey="value" cornerRadius={10} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <p className="text-center text-xs text-muted-foreground mt-1">0% completion</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground mb-6">Settings</h1>
                  <div className="glass rounded-2xl p-6 space-y-5 max-w-lg">
                    <div>
                      <label className="text-sm text-muted-foreground block mb-1">App Name</label>
                      <input value={appName} onChange={e => setAppName(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-neon-green focus:ring-4 focus:ring-neon-green/10 outline-none text-sm font-black text-white uppercase tracking-widest transition-all" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Maintenance Mode</span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { setMaintenance(!maintenance); toast(maintenance ? 'Maintenance mode OFF' : 'Maintenance mode ON', { icon: '🔧' }); }}
                        className={`w-12 h-6 rounded-full transition-all ${maintenance ? 'gradient-primary' : 'bg-muted'} relative`}
                      >
                        <motion.div layout className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 ${maintenance ? 'right-0.5' : 'left-0.5'}`} />
                      </motion.button>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => toast.success('Settings saved!')}
                      className="px-6 py-3 rounded-full gradient-primary text-primary-foreground font-semibold shadow-lg"
                    >
                      Save Settings
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowLogoutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass-strong rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl"
            >
              <h3 className="font-display text-lg font-bold text-foreground mb-2">Confirm Logout</h3>
              <p className="text-sm text-muted-foreground mb-6">Are you sure you want to log out of the admin panel?</p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3 rounded-full bg-muted text-foreground font-medium text-sm"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLogout}
                  className="flex-1 py-3 rounded-full bg-destructive text-destructive-foreground font-medium text-sm"
                >
                  Logout
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;