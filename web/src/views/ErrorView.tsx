import Main from '@/components/Main'
import Notice from '@/components/Notice'
import { useRouteError } from 'react-router-dom'

export default function ErrorView() {
  const { error } = useRouteError() as { error: Error }

  if (error) return (
    <Main>
      <h1>Error</h1>
      <Notice error={error as Error} />
    </Main>
  )
}
