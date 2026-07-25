import fs from 'fs'
import { execSync } from 'child_process'

// 1. Fix PaymentSelector - move OPTIONS inside component
let ps = fs.readFileSync('src/components/payment/PaymentSelector.tsx', 'utf8')
// Remove the static OPTIONS array at module level
ps = ps.replace(/const OPTIONS: PaymentOption\[\] = \[[\s\S]*?\];\n\n(export default function)/, '$1')
// Add OPTIONS inside the component
ps = ps.replace(
  'export default function PaymentSelector({ selected, onChange, total, kdPointsBalance = 0 }: PaymentSelectorProps) {',
  `export default function PaymentSelector({ selected, onChange, total, kdPointsBalance = 0 }: PaymentSelectorProps) {
  const OPTIONS: PaymentOption[] = [
    { id: 'pix', name: 'PIX', description: 'Pagamento instantâneo', icon: <Smartphone className="w-5 h-5" />, discount: '5% OFF', processingTime: 'Confirmação imediata', fee: '0,99%' },
    { id: 'credit_card', name: 'Cartão de Crédito', description: 'Até 12x sem juros', icon: <CreditCard className="w-5 h-5" />, processingTime: 'Confirmação em até 3 dias', fee: '4,99% + R$0,50' },
    { id: 'debit_card', name: 'Cartão de Débito', description: 'Débito em conta', icon: <CreditCard className="w-5 h-5" />, processingTime: 'Confirmação em até 2 dias', fee: '2,99% + R$0,30' },
    { id: 'boleto', name: 'Boleto Bancário', description: 'Vencimento em 3 dias', icon: <FileText className="w-5 h-5" />, processingTime: 'Confirmação em até 3 dias úteis', fee: '1,99% + R$3,00' },
    { id: 'kd_points', name: 'KD Points', description: \`Saldo: \${(kdPointsBalance || 0).toLocaleString()} pts\`, icon: <Coins className="w-5 h-5" />, processingTime: 'Instantâneo', fee: '0%' },
  ]`
)
fs.writeFileSync('src/components/payment/PaymentSelector.tsx', ps)
console.log('✅ Fixed PaymentSelector')

// 2. Fix CartEngine Map iteration
let ce = fs.readFileSync('src/domain/cart/CartEngine.ts', 'utf8')
ce = ce.replace(/for \(const \[sellerId, sellerItems\] of sellerMap\)/g, 'for (const [sellerId, sellerItems] of Array.from(sellerMap.entries()))')
fs.writeFileSync('src/domain/cart/CartEngine.ts', ce)
console.log('✅ Fixed CartEngine')

// 3. Fix wallet route map callbacks
let wr = fs.readFileSync('src/app/api/v1/wallet/route.ts', 'utf8')
wr = wr.replace(/\.map\(e => \({/g, '.map((e: any) => ({')
wr = wr.replace(/\.map\(e => \(\{/g, '.map((e: any) => ({')
fs.writeFileSync('src/app/api/v1/wallet/route.ts', wr)
console.log('✅ Fixed wallet route')

console.log('All fixes done')
