import { isMobile } from 'react-device-detect'

export default function Page() {
  return (
    <div>
      {isMobile ? 'Mobile' : 'Desktop'}
    </div>
  )
}