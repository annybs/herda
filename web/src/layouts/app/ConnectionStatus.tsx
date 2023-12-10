import './ConnectionStatus.scss'
import Row from '@/components/Row'
import { useConnection } from '@/hooks'
import { SignalIcon, SignalSlashIcon } from '@heroicons/react/20/solid'

export default function ConnectionStatus() {
  const { available, info, options } = useConnection()

  if (available) return (
    <Row className="connection-status">
      <SignalIcon title={`Connected to ${options.host}`} />
      <span>v{info?.version}</span>
    </Row>
  )

  return (
    <Row className="connection-status">
      <SignalSlashIcon title={`Not connected to ${options.host}`} />
    </Row>
  )
}
