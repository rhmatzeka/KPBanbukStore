import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/DashboardEnhanced';
import Products from './components/Products';
import Categories from './components/Categories';
import Transactions from './components/Transactions';
import Users from './components/Users';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCurrentPage('dashboard');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSidebarOpen(false); // Close sidebar on mobile after selecting
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

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
            {user.role?.name === 'admin' && (
              <div 
                className={`menu-item ${currentPage === 'users' ? 'active' : ''}`}
                onClick={() => handlePageChange('users')}
              >
                Kelola User
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
          {currentPage === 'users' && <Users user={user} />}
        </div>
      </div>
    </div>
  );
}

export default App;
