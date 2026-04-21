import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/DashboardEnhanced';
import Products from './components/Products';
import Categories from './components/Categories';
import Transactions from './components/Transactions';
import Users from './components/Users';
import StockOpname from './components/StockOpname';
import AuditLogs from './components/AuditLogs';
import Reports from './components/Reports';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      if (!localStorage.getItem('token') && parsedUser.id) {
        localStorage.setItem('token', `dummy-token-${parsedUser.id}`);
      }
    }
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token || `dummy-token-${userData.id}`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentPage('dashboard');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSidebarOpen(false); // Close sidebar on mobile after selecting
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const canManageUsers = user.role?.name === 'owner';
  const canUseStockOpname = ['owner', 'admin'].includes(user.role?.name);
  const canViewReports = ['owner', 'admin'].includes(user.role?.name);
  const canViewAuditLogs = user.role?.name === 'owner';

  return (
    <div className="app">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <h2>Inventaris Gudang</h2>
        <div></div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      <div className="dashboard">
        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h2>Inventaris Gudang</h2>
            <p>{user.name} ({user.role?.display_name})</p>
          </div>
          <div className="sidebar-menu">
            <div 
              className={`menu-item ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => handlePageChange('dashboard')}
            >
              Dashboard
            </div>
            <div 
              className={`menu-item ${currentPage === 'products' ? 'active' : ''}`}
              onClick={() => handlePageChange('products')}
            >
              Produk
            </div>
            <div 
              className={`menu-item ${currentPage === 'categories' ? 'active' : ''}`}
              onClick={() => handlePageChange('categories')}
            >
              Kategori
            </div>
            <div 
              className={`menu-item ${currentPage === 'transactions' ? 'active' : ''}`}
              onClick={() => handlePageChange('transactions')}
            >
              Transaksi
            </div>
            {canUseStockOpname && (
              <div 
                className={`menu-item ${currentPage === 'stock-opname' ? 'active' : ''}`}
                onClick={() => handlePageChange('stock-opname')}
              >
                Stock Opname
              </div>
            )}
            {canViewReports && (
              <div 
                className={`menu-item ${currentPage === 'reports' ? 'active' : ''}`}
                onClick={() => handlePageChange('reports')}
              >
                Laporan
              </div>
            )}
            {canManageUsers && (
              <div 
                className={`menu-item ${currentPage === 'users' ? 'active' : ''}`}
                onClick={() => handlePageChange('users')}
              >
                Kelola User
              </div>
            )}
            {canViewAuditLogs && (
              <div 
                className={`menu-item ${currentPage === 'audit-logs' ? 'active' : ''}`}
                onClick={() => handlePageChange('audit-logs')}
              >
                Audit Log
              </div>
            )}
            <div className="menu-item menu-item-logout" onClick={handleLogout}>
              Keluar
            </div>
          </div>
        </div>
        <div className="main-content">
          {currentPage === 'dashboard' && <Dashboard user={user} onNavigate={handlePageChange} />}
          {currentPage === 'products' && <Products user={user} />}
          {currentPage === 'categories' && <Categories user={user} />}
          {currentPage === 'transactions' && <Transactions user={user} />}
          {currentPage === 'stock-opname' && canUseStockOpname && <StockOpname user={user} />}
          {currentPage === 'reports' && canViewReports && <Reports />}
          {currentPage === 'users' && canManageUsers && <Users user={user} />}
          {currentPage === 'audit-logs' && canViewAuditLogs && <AuditLogs />}
        </div>
      </div>
    </div>
  );
}

export default App;
