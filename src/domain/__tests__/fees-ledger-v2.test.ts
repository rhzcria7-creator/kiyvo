import { calculateFeeV2 } from '@/domain/fees/FeeEngineV2'
import { calculateBalances,createEscrowJournal,validateJournal } from '@/domain/ledger/LedgerService'
test('fee v2 and ledger escrow',()=>{expect(calculateFeeV2('free',100,0).platformFee).toBe(0); expect(calculateFeeV2('free',100,5000,'legend').platformFee).toBe(7.7); const journal=createEscrowJournal('buyer','seller',100,new Date(Date.now()+86400000)); expect(validateJournal(journal)).toBe(true); expect(calculateBalances(journal,'seller').pending).toBe(100)})
