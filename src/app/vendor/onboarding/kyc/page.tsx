'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import {
  Shield,
  FileText,
  Camera,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Upload,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Eye,
  User,
  Building2,
  Smartphone,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// /vendor/onboarding/kyc — Fluxo KYC Completo (4 passos)
// Passo 1: CPF/CNPJ (Validação via BrasilAPI)
// Passo 2: Upload de Documento (Frente e Verso)
// Passo 3: Selfie com Documento + Data (Webcam)
// Passo 4: Comprovante de Residência
// ═══════════════════════════════════════════════════════════════

type KYCStep = 'cpf' | 'docs' | 'selfie' | 'address' | 'complete';
type DocumentType = 'cpf' | 'cnpj';

interface KYCState {
  docType: DocumentType;
  docNumber: string;
  fullName: string;
  docFrontFile: File | null;
  docBackFile: File | null;
  selfieFile: File | null;
  addressFile: File | null;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  isSubmitting: boolean;
  error: string | null;
}

const STEPS: { key: KYCStep; label: string; icon: React.ReactNode }[] = [
  { key: 'cpf', label: 'CPF / CNPJ', icon: <FileText className="w-4 h-4" /> },
  { key: 'docs', label: 'Documento', icon: <Upload className="w-4 h-4" /> },
  { key: 'selfie', label: 'Selfie', icon: <Camera className="w-4 h-4" /> },
  { key: 'address', label: 'Endereço', icon: <MapPin className="w-4 h-4" /> },
];

export default function VendorKYCPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [currentStep, setCurrentStep] = useState<KYCStep>('cpf');
  const [state, setState] = useState<KYCState>({
    docType: 'cpf',
    docNumber: '',
    fullName: '',
    docFrontFile: null,
    docBackFile: null,
    selfieFile: null,
    addressFile: null,
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    isSubmitting: false,
    error: null,
  });

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);

  // Máscara CPF/CNPJ
  const formatDocNumber = useCallback((value: string, type: DocumentType) => {
    const digits = value.replace(/\D/g, '');
    if (type === 'cpf') {
      return digits
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return digits
      .slice(0, 14)
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }, []);

  // Validação CPF/CNPJ
  const validateCPF = useCallback((cpf: string): boolean => {
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(digits)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(digits.charAt(i)) * (10 - i);
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(digits.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(digits.charAt(i)) * (11 - i);
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(digits.charAt(10));
  }, []);

  // Consultar BrasilAPI para validar CPF/CNPJ
  const validateDocument = useCallback(async () => {
    const digits = state.docNumber.replace(/\D/g, '');
    if (state.docType === 'cpf' && !validateCPF(state.docNumber)) {
      setState((prev) => ({ ...prev, error: 'CPF inválido' }));
      return false;
    }

    try {
      // Consultar BrasilAPI (placeholder — em produção consulta real)
      const endpoint = state.docType === 'cpf'
        ? `https://brasilapi.com.br/api/cpf/v1/${digits}`
        : `https://brasilapi.com.br/api/cnpj/v1/${digits}`;

      const response = await fetch(endpoint);

      if (response.ok) {
        const data = await response.json();
        const name = data.nome || data.razao_social || '';
        setState((prev) => ({ ...prev, fullName: name, error: null }));
        return true;
      }

      // API pode estar fora do ar — aceitar se o formato for válido
      if (state.docType === 'cpf' && validateCPF(state.docNumber)) {
        setState((prev) => ({ ...prev, error: null }));
        return true;
      }

      setState((prev) => ({ ...prev, error: 'Não foi possível verificar o documento' }));
      return false;
    } catch {
      // Fallback — aceitar se o formato for válido
      if (state.docType === 'cpf' && validateCPF(state.docNumber)) {
        setState((prev) => ({ ...prev, error: null }));
        return true;
      }
      return false;
    }
  }, [state.docNumber, state.docType, validateCPF]);

  // Buscar CEP via ViaCEP
  const lookupCEP = useCallback(async (cep: string) => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      if (response.ok) {
        const data = await response.json();
        if (!data.erro) {
          setState((prev) => ({
            ...prev,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || '',
          }));
        }
      }
    } catch {
      // Silencioso — usuário preenche manualmente
    }
  }, []);

  // Webcam para selfie
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      setState((prev) => ({ ...prev, error: 'Não foi possível acessar a câmera' }));
    }
  }, []);

  const takeSelfie = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
        setState((prev) => ({ ...prev, selfieFile: file }));
      }
    }, 'image/jpeg', 0.9);
    // Parar câmera
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }, [stream]);

  // Upload de documento para Supabase Storage
  const uploadFile = useCallback(async (file: File, documentType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    formData.append('userId', user?.id || '');

    const response = await fetch('/api/v1/kyc/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Erro no upload');
    return response.json();
  }, [user]);

  // Submeter KYC completo
  const submitKYC = useCallback(async () => {
    setState((prev) => ({ ...prev, isSubmitting: true, error: null }));
    try {
      // Upload de todos os documentos
      if (state.docFrontFile) await uploadFile(state.docFrontFile, 'id_front');
      if (state.docBackFile) await uploadFile(state.docBackFile, 'id_back');
      if (state.selfieFile) await uploadFile(state.selfieFile, 'selfie_with_doc');
      if (state.addressFile) await uploadFile(state.addressFile, 'proof_of_address');

      // Atualizar profile com dados KYC
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf_cnpj_type: state.docType,
          kyc_status: 'docs_uploaded',
          address_cep: state.cep,
          address_street: state.street,
          address_number: state.number,
          address_complement: state.complement,
          address_neighborhood: state.neighborhood,
          address_city: state.city,
          address_state: state.state,
        }),
      });

      if (!response.ok) throw new Error('Erro ao salvar dados');

      setCurrentStep('complete');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao submeter';
      setState((prev) => ({ ...prev, error: message }));
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [state, uploadFile]);

  // Avançar passo
  const goNext = useCallback(async () => {
    if (currentStep === 'cpf') {
      const valid = await validateDocument();
      if (!valid) return;
      setCurrentStep('docs');
    } else if (currentStep === 'docs') {
      if (!state.docFrontFile || !state.docBackFile) {
        setState((prev) => ({ ...prev, error: 'Envie frente e verso do documento' }));
        return;
      }
      setCurrentStep('selfie');
    } else if (currentStep === 'selfie') {
      if (!state.selfieFile) {
        setState((prev) => ({ ...prev, error: 'Tire uma selfie com o documento' }));
        return;
      }
      setCurrentStep('address');
    } else if (currentStep === 'address') {
      if (!state.cep || !state.street || !state.number || !state.city) {
        setState((prev) => ({ ...prev, error: 'Preencha todos os campos obrigatórios' }));
        return;
      }
      await submitKYC();
    }
  }, [currentStep, state, validateDocument, submitKYC]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  // Se já está aprovado
  if (profile?.kyc_status === 'approved') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">KYC Aprovado! 🎉</h2>
          <p className="text-slate-400 mb-6">Você já pode vender no Kiyvo</p>
          <button onClick={() => router.push('/vendor/dashboard')} className="px-6 py-3 bg-blue-600 rounded-xl text-white font-medium">
            Ir para o Painel
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Verificação de Identidade</h1>
          <p className="text-slate-400 text-sm mt-1">
            Para vender no Kiyvo, precisamos verificar sua identidade. Seus dados são protegidos com criptografia.
          </p>
        </motion.div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((step, i) => (
            <div key={step.key} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                i < currentStepIndex
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : i === currentStepIndex
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-slate-800 text-slate-500'
              }`}>
                {i < currentStepIndex ? <CheckCircle className="w-3 h-3" /> : step.icon}
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 ${i < currentStepIndex ? 'bg-emerald-500' : 'bg-slate-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Conteúdo do Passo */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === 'cpf' && (
              <StepCPF
                docType={state.docType}
                docNumber={state.docNumber}
                fullName={state.fullName}
                error={state.error}
                onDocTypeChange={(v) => setState((p) => ({ ...p, docType: v, docNumber: '', fullName: '', error: null }))}
                onDocNumberChange={(v) => setState((p) => ({ ...p, docNumber: formatDocNumber(v, p.docType), error: null }))}
              />
            )}

            {currentStep === 'docs' && (
              <StepDocs
                docFrontFile={state.docFrontFile}
                docBackFile={state.docBackFile}
                error={state.error}
                onFrontFileChange={(f) => setState((p) => ({ ...p, docFrontFile: f, error: null }))}
                onBackFileChange={(f) => setState((p) => ({ ...p, docBackFile: f, error: null }))}
              />
            )}

            {currentStep === 'selfie' && (
              <StepSelfie
                selfieFile={state.selfieFile}
                error={state.error}
                videoRef={videoRef}
                canvasRef={canvasRef}
                stream={stream}
                onStartCamera={startCamera}
                onTakeSelfie={takeSelfie}
                onSelfieFileChange={(f) => setState((p) => ({ ...p, selfieFile: f, error: null }))}
              />
            )}

            {currentStep === 'address' && (
              <StepAddress
                cep={state.cep}
                street={state.street}
                number={state.number}
                complement={state.complement}
                neighborhood={state.neighborhood}
                city={state.city}
                uf={state.state}
                addressFile={state.addressFile}
                error={state.error}
                onCEPChange={(v) => {
                  setState((p) => ({ ...p, cep: v.replace(/\D/g, '').slice(0, 8) }));
                  if (v.replace(/\D/g, '').length === 8) lookupCEP(v);
                }}
                onStreetChange={(v) => setState((p) => ({ ...p, street: v }))}
                onNumberChange={(v) => setState((p) => ({ ...p, number: v }))}
                onComplementChange={(v) => setState((p) => ({ ...p, complement: v }))}
                onNeighborhoodChange={(v) => setState((p) => ({ ...p, neighborhood: v }))}
                onCityChange={(v) => setState((p) => ({ ...p, city: v }))}
                onUFChange={(v) => setState((p) => ({ ...p, state: v }))}
                onAddressFileChange={(f) => setState((p) => ({ ...p, addressFile: f, error: null }))}
              />
            )}

            {currentStep === 'complete' && (
              <div className="text-center py-12">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                  <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-3">Documentos Enviados! 🎉</h2>
                <p className="text-slate-400 mb-2">
                  Sua verificação está em análise. Você receberá uma notificação em até 24 horas.
                </p>
                <p className="text-slate-500 text-sm mb-8">
                  Enquanto isso, você já pode criar seus anúncios (eles ficarão como rascunho até a aprovação).
                </p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => router.push('/vendor/dashboard')} className="px-6 py-3 bg-blue-600 rounded-xl text-white font-medium">
                    Ir para o Painel
                  </button>
                  <button onClick={() => router.push('/vender')} className="px-6 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium">
                    Criar Anúncio
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Erro */}
        {state.error && currentStep !== 'complete' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-900/20 border border-red-600/20 rounded-xl text-red-400 text-sm flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {state.error}
          </motion.div>
        )}

        {/* Botões de Navegação */}
        {currentStep !== 'complete' && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => {
                const idx = STEPS.findIndex((s) => s.key === currentStep);
                if (idx > 0) setCurrentStep(STEPS[idx - 1].key);
              }}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-1 px-4 py-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={goNext}
              disabled={state.isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-slate-700 disabled:to-slate-700 rounded-xl text-white font-medium transition-all"
            >
              {state.isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  {currentStep === 'address' ? 'Enviar Verificação' : 'Continuar'}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// Passo 1: CPF/CNPJ
// ───────────────────────────────────────────────────────────────

function StepCPF({ docType, docNumber, fullName, error, onDocTypeChange, onDocNumberChange }: {
  docType: DocumentType;
  docNumber: string;
  fullName: string;
  error: string | null;
  onDocTypeChange: (v: DocumentType) => void;
  onDocNumberChange: (v: string) => void;
}) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-5">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-400" />
        Documento de Identificação
      </h2>

      <div className="flex gap-3">
        <button
          onClick={() => onDocTypeChange('cpf')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors ${
            docType === 'cpf' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-700 bg-slate-800/50 text-slate-400'
          }`}
        >
          <User className="w-4 h-4" />
          Pessoa Física (CPF)
        </button>
        <button
          onClick={() => onDocTypeChange('cnpj')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors ${
            docType === 'cnpj' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-700 bg-slate-800/50 text-slate-400'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Pessoa Jurídica (CNPJ)
        </button>
      </div>

      <div>
        <label className="text-sm text-slate-400 mb-1 block">{docType === 'cpf' ? 'CPF' : 'CNPJ'}</label>
        <input
          type="text"
          value={docNumber}
          onChange={(e) => onDocNumberChange(e.target.value)}
          placeholder={docType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-lg font-mono focus:border-blue-500 outline-none placeholder:text-slate-500"
          maxLength={docType === 'cpf' ? 14 : 18}
        />
      </div>

      {fullName && (
        <div className="p-3 bg-emerald-900/10 border border-emerald-600/20 rounded-xl">
          <p className="text-emerald-400 text-sm font-medium">Nome encontrado: {fullName}</p>
        </div>
      )}

      <p className="text-slate-500 text-xs flex items-center gap-1">
        <Shield className="w-3 h-3" />
        Seu documento é encriptado e nunca é exibido em texto plano
      </p>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// Passo 2: Upload de Documento
// ───────────────────────────────────────────────────────────────

function StepDocs({ docFrontFile, docBackFile, error, onFrontFileChange, onBackFileChange }: {
  docFrontFile: File | null;
  docBackFile: File | null;
  error: string | null;
  onFrontFileChange: (f: File | null) => void;
  onBackFileChange: (f: File | null) => void;
}) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-5">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <Upload className="w-5 h-5 text-blue-400" />
        Documento de Identidade (RG ou CNH)
      </h2>

      <FileUploadZone
        label="Frente do Documento"
        file={docFrontFile}
        onFileChange={onFrontFileChange}
        accept="image/jpeg,image/png,image/webp,application/pdf"
      />

      <FileUploadZone
        label="Verso do Documento"
        file={docBackFile}
        onFileChange={onBackFileChange}
        accept="image/jpeg,image/png,image/webp,application/pdf"
      />

      <p className="text-slate-500 text-xs">
        Formatos aceitos: JPG, PNG, WebP, PDF. Máximo: 10MB. Os documentos ficam em um bucket privado e você não pode lê-los após o envio.
      </p>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// Passo 3: Selfie com Documento
// ───────────────────────────────────────────────────────────────

function StepSelfie({ selfieFile, error, videoRef, canvasRef, stream, onStartCamera, onTakeSelfie, onSelfieFileChange }: {
  selfieFile: File | null;
  error: string | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  stream: MediaStream | null;
  onStartCamera: () => void;
  onTakeSelfie: () => void;
  onSelfieFileChange: (f: File | null) => void;
}) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-5">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <Camera className="w-5 h-5 text-blue-400" />
        Selfie com Documento
      </h2>

      <p className="text-slate-400 text-sm">
        Tire uma foto segurando seu documento ao lado do rosto. A data deve ser visível.
      </p>

      {selfieFile ? (
        <div className="text-center">
          <div className="w-48 h-48 rounded-2xl overflow-hidden mx-auto mb-4 border-2 border-emerald-500/30">
            <img src={URL.createObjectURL(selfieFile)} alt="Selfie" className="w-full h-full object-cover" />
          </div>
          <p className="text-emerald-400 text-sm flex items-center justify-center gap-1">
            <CheckCircle className="w-4 h-4" /> Selfie capturada
          </p>
          <button onClick={() => onSelfieFileChange(null)} className="mt-2 text-red-400 text-sm hover:text-red-300">
            Tirar outra
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Webcam ao vivo */}
          {stream ? (
            <div className="text-center">
              <div className="w-64 h-48 rounded-2xl overflow-hidden mx-auto border border-slate-700">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              </div>
              <button onClick={onTakeSelfie} className="mt-4 px-6 py-2.5 bg-blue-600 rounded-xl text-white font-medium flex items-center gap-2 mx-auto">
                <Camera className="w-4 h-4" />
                Capturar
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={onStartCamera}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400 hover:bg-blue-600/30 transition-colors"
              >
                <Smartphone className="w-5 h-5" />
                Usar Câmera
              </button>
              <label className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:border-slate-600 cursor-pointer transition-colors">
                <Upload className="w-5 h-5" />
                Upload de Foto
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onSelfieFileChange(f);
                  }}
                />
              </label>
            </div>
          )}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// Passo 4: Comprovante de Residência
// ───────────────────────────────────────────────────────────────

function StepAddress({ cep, street, number, complement, neighborhood, city, uf, addressFile, error, onCEPChange, onStreetChange, onNumberChange, onComplementChange, onNeighborhoodChange, onCityChange, onUFChange, onAddressFileChange }: {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  uf: string;
  addressFile: File | null;
  error: string | null;
  onCEPChange: (v: string) => void;
  onStreetChange: (v: string) => void;
  onNumberChange: (v: string) => void;
  onComplementChange: (v: string) => void;
  onNeighborhoodChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onUFChange: (v: string) => void;
  onAddressFileChange: (f: File | null) => void;
}) {
  const states = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-5">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <MapPin className="w-5 h-5 text-blue-400" />
        Comprovante de Residência
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-400 mb-1 block">CEP *</label>
          <input
            type="text"
            value={cep}
            onChange={(e) => onCEPChange(e.target.value)}
            placeholder="00000000"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-blue-500 outline-none placeholder:text-slate-500"
            maxLength={8}
          />
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Estado *</label>
          <select value={uf} onChange={(e) => onUFChange(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-blue-500 outline-none">
            <option value="">Selecione</option>
            {states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-sm text-slate-400 mb-1 block">Rua *</label>
          <input type="text" value={street} onChange={(e) => onStreetChange(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-blue-500 outline-none placeholder:text-slate-500" placeholder="Nome da rua" />
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Número *</label>
          <input type="text" value={number} onChange={(e) => onNumberChange(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-blue-500 outline-none" />
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Complemento</label>
          <input type="text" value={complement} onChange={(e) => onComplementChange(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-blue-500 outline-none" placeholder="Apto, Bloco, etc." />
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Bairro</label>
          <input type="text" value={neighborhood} onChange={(e) => onNeighborhoodChange(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-blue-500 outline-none" />
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Cidade *</label>
          <input type="text" value={city} onChange={(e) => onCityChange(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-blue-500 outline-none" />
        </div>
      </div>

      {/* Upload do comprovante */}
      <FileUploadZone
        label="Comprovante de Residência (conta de luz, água, gás)"
        file={addressFile}
        onFileChange={onAddressFileChange}
        accept="image/jpeg,image/png,image/webp,application/pdf"
      />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// Componente de Upload de Arquivo reutilizável
// ───────────────────────────────────────────────────────────────

function FileUploadZone({ label, file, onFileChange, accept }: {
  label: string;
  file: File | null;
  onFileChange: (f: File | null) => void;
  accept: string;
}) {
  return (
    <div>
      <label className="text-sm text-slate-400 mb-2 block">{label}</label>
      {file ? (
        <div className="flex items-center gap-3 p-3 bg-emerald-900/10 border border-emerald-600/20 rounded-xl">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-white text-sm flex-1 truncate">{file.name}</span>
          <span className="text-slate-400 text-xs">{(file.size / 1024).toFixed(0)} KB</span>
          <button onClick={() => onFileChange(null)} className="text-red-400 hover:text-red-300">
            <X />
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center gap-2 py-6 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-blue-500/50 transition-colors">
          <Upload className="w-5 h-5 text-slate-400" />
          <span className="text-slate-400 text-sm">Clique para selecionar ou arraste aqui</span>
          <input type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileChange(f); }} />
        </label>
      )}
    </div>
  );
}

function X() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
