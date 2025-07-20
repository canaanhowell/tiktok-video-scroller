import { CategoryVideoPage } from '@/components/CategoryVideoPage'

export default function PhotoTestPage() {
  return (
    <div>
      <div className="bg-red-500 text-white p-4">
        This is a test page - if you see this red bar, the page is loading correctly
      </div>
      <CategoryVideoPage category="photographers" title="Photographers Test" />
    </div>
  )
}