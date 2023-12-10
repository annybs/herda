import Main from '@/components/Main'
import Notice from '@/components/Notice'
import { useDocument } from '@/hooks'
import { useEffect } from 'react'
import { useRouteError } from 'react-router-dom'

export default function ErrorView() {
  const doc = useDocument()
  const { error } = useRouteError() as { error: Error }

  useEffect(() => {
    doc.setTitle('Error')
  }, [doc])

  if (error) return (
    <Main>
      <h1>Error</h1>
      <Notice error={error as Error} />
    </Main>
  )
}
