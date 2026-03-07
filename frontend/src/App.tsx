// src/App.tsx
import React, { useState } from 'react';
import PublicPage from './components/public/PublicPage';
import AdminPage from './components/admin/AdminPage';

type View = 'public' | 'admin';

const App: React.FC = () => {
  const [view, setView] = useState<View>('public');

  return view === 'public'
    ? <PublicPage onGoAdmin={() => setView('admin')} />
    : <AdminPage onGoPublic={() => setView('public')} />;
};

export default App;
