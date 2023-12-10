import Button from '@/components/button/Button'
import { UserCircleIcon } from '@heroicons/react/20/solid'
import { useNavigate } from 'react-router-dom'
import { useSession } from '@/hooks'

export default function AccountButton() {
  const navigate = useNavigate()
  const { account } = useSession()

  return account && (
    <Button onClick={() => navigate('/account/settings')}>
      <UserCircleIcon />
      <span>{account.email}</span>
    </Button>
  )
}
