// Global loading state — Premium Kiyvo loader (SVG + Framer Motion)
import { LoadingScreen } from '@/components/ui/LoadingScreen'

export default function Loading() {
  return <LoadingScreen message="Carregando" size={72} fullscreen={false} />
}
