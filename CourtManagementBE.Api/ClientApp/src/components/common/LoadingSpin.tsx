import { Spin } from 'antd'

type LoadingSpinProps = {
  minHeight?: number
  tip?: string
}

export function LoadingSpin({ minHeight = 320, tip = 'Loading...' }: LoadingSpinProps) {
  return (
    <div className="flex w-full items-center justify-center" style={{ minHeight }}>
      <Spin size="large" tip={tip} />
    </div>
  )
}
