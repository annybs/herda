import Button from '@/components/button/Button'
import { useNavigate } from 'react-router-dom'
import { useSession } from '@/hooks'
import { ArrowLeftOnRectangleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/20/solid'

export default function LoginLogoutButton() {
  const navigate = useNavigate()
  const { loggedIn, ...session } = useSession()

  function logout() {
    session.logout()
    navigate('/login')
  }

  if (loggedIn) return (
    <Button
      className="negative logout"
      confirm={(
        <>
          <ArrowRightOnRectangleIcon />
          <span>Really log out?</span>
        </>
      )}
      onClick={logout}
    >
      <ArrowRightOnRectangleIcon />
      <span>Log out</span>
    </Button>
  )

  return (
    <Button
      className="positive login"
      onClick={() => navigate('/login')}
    >
      <ArrowLeftOnRectangleIcon />
      <span>Log in</span>
    </Button>
  )
}
