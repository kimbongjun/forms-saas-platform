import Image from 'next/image'
import Link from 'next/link'
import classysLogo from '@/imgs/classys_logo.svg'
import { APP_TITLE } from '@/constants/branding'

export default async function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-8">
        <Link href="/dashboard" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <Image src={classysLogo} alt={APP_TITLE} width={118} height={26} priority className="h-7 w-auto" />
          <span className="text-sm font-semibold text-gray-900">{APP_TITLE}</span>
        </Link>
      </div>
    </header>
  )
}
