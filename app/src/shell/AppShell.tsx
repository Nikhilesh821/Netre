import { NavLink, Outlet } from 'react-router-dom';
import { HomeIcon, PhotoIcon, BellIcon, PlusIcon, MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { ThemeToggle } from '../components/ThemeToggle';
import { FeedSidebar } from '../components/FeedSidebar';

export function AppShell() {
  return (
    <div className="app-container">
      {/* Left Navigation Sidebar */}
      <nav className="nav-sidebar surface-panel">
        <div className="nav-links">
          <div className="nav-logo">evizz</div>
          <NavLink to="/" end className={({ isActive }) => \`nav-item \${isActive ? 'active' : ''}\`} title="Home">
            <HomeIcon style={{ width: 24, height: 24 }} />
          </NavLink>
          <NavLink to="/live" className={({ isActive }) => \`nav-item \${isActive ? 'active' : ''}\`} title="Gallery">
            <PhotoIcon style={{ width: 24, height: 24 }} />
          </NavLink>
          <NavLink to="/playback" className={({ isActive }) => \`nav-item \${isActive ? 'active' : ''}\`} title="Notifications">
            <BellIcon style={{ width: 24, height: 24 }} />
          </NavLink>
          <button className="nav-item" title="Add Device">
            <PlusIcon style={{ width: 24, height: 24 }} />
          </button>
          <button className="nav-item" title="Search">
            <MagnifyingGlassIcon style={{ width: 24, height: 24 }} />
          </button>
        </div>
        
        <div className="nav-links">
          <ThemeToggle />
          <button className="nav-item" title="Profile">
            <UserCircleIcon style={{ width: 32, height: 32 }} />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content surface-panel">
        <Outlet />
      </main>

      {/* Right Feed Sidebar */}
      <FeedSidebar />
    </div>
  );
}
