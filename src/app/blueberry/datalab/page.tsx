import { Suspense } from 'react'
import DatalabResultClient from './_components/DatalabResultClient'

export const metadata = { title: 'DataLab 결과 | 블루베리' }

export default function DatalabResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-32 text-sm text-gray-400">
          로딩 중...
        </div>
      }
    >
      <DatalabResultClient />
    </Suspense>
  )
}
