import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-white to-purple-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
      <Sidebar />
      <div className="lg:pl-72">
        <TopBar />
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

