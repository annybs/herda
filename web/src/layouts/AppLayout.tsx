import './AppLayout.scss'
import AccountButton from './app/AccountButton'
import ButtonSet from '@/components/ButtonSet'
import ConnectionStatus from './app/ConnectionStatus'
import Copyright from './app/Copyright'
import LoginLogoutButton from './app/LoginLogoutButton'
import type { PropsWithChildren } from 'react'
import { useSession } from '@/hooks'

export default function AppLayout({ children }: Pick<PropsWithChildren, 'children'>) {
  const { loggedIn } = useSession()

  return (
    <div className="app">
      <header className="top">
        {loggedIn && (
          <ButtonSet>
            <AccountButton />
          </ButtonSet>
        )}
        <div className="spacer"></div>
        <nav className="user-menu">
          <ButtonSet>
            <LoginLogoutButton />
          </ButtonSet>
        </nav>
      </header>

      {children}

      <footer className="bottom">
        <ConnectionStatus />
        <div className="spacer"></div>
        <Copyright />
      </footer>
    </div>
  )
}
