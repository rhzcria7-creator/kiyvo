// /afiliados → redireciona para /indique-ganhe (página canônica do programa)
import { redirect } from 'next/navigation'

export default function AfiliadosRedirect() {
  redirect('/indique-ganhe')
}
