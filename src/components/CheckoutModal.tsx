"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  FileText,
  Lock,
  Smartphone,
  Truck,
  Upload,
  Wallet,
  X,
} from "lucide-react";
import { useCartStore } from "@/store/useStore";
import {
  formatMoney,
  type ProductCurrency,
} from "@/utils/formatPrice";
import { formatVes, useBcvRate } from "@/components/BcvRateProvider";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMode = "divisas" | "bolivares";
type PaymentMethod =
  | "efectivo"
  | "zelle"
  | "binance"
  | "pago_movil"
  | "transferencia";

type CustomerDetails = {
  fullName: string;
  idNumber: string;
  phone: string;
  email: string;
  address: string;
  city: string;
};

type PaymentDetails = {
  mode: PaymentMode;
  method: PaymentMethod;
  reference: string;
  proofName: string;
};

type SubmittedOrder = {
  orderNumber: string;
  customerName: string;
  paymentLabel: string;
  total: string;
  totalVes: string | null;
  whatsappUrl: string;
};

const WHATSAPP_NUMBER = "584128050526";
const EMPTY_CUSTOMER: CustomerDetails = {
  fullName: "",
  idNumber: "",
  phone: "",
  email: "",
  address: "",
  city: "",
};
const EMPTY_PAYMENT: PaymentDetails = {
  mode: "divisas",
  method: "efectivo",
  reference: "",
  proofName: "",
};

const PAYMENT_METHODS = [
  {
    id: "efectivo" as PaymentMethod,
    mode: "divisas" as PaymentMode,
    label: "Efectivo",
    description: "Paga en divisas al recoger",
    icon: Banknote,
  },
  {
    id: "zelle" as PaymentMethod,
    mode: "divisas" as PaymentMode,
    label: "Zelle",
    description: "Pago rápido por Zelle",
    icon: Wallet,
  },
  {
    id: "binance" as PaymentMethod,
    mode: "divisas" as PaymentMode,
    label: "Binance Pay",
    description: "Pago con Binance Pay",
    icon: Wallet,
  },
  {
    id: "pago_movil" as PaymentMethod,
    mode: "bolivares" as PaymentMode,
    label: "Pago Móvil",
    description: "Pago móvil en bolívares",
    icon: Smartphone,
  },
  {
    id: "transferencia" as PaymentMethod,
    mode: "bolivares" as PaymentMode,
    label: "Transferencia Bancaria",
    description: "Transferencia en bolívares",
    icon: Building2,
  },
];

function getPaymentInstructions(
  method: PaymentMethod,
  totalVes: number | null
): string[] {
  switch (method) {
    case "pago_movil":
      return [
        "Banco: Bancamiga (0172)",
        "Cédula de identidad: V-30.235.425",
        "Teléfono: 0412-8050526",
        `Monto exacto a transferir: ${totalVes ? formatVes(totalVes) : "Pendiente de tasa BCV"}`,
      ];
    case "transferencia":
      return [
        "Banco: Bancamiga (0172)",
        "Cédula de identidad: V-30.235.425",
        "Teléfono de contacto: 0412-8050526",
        `Monto exacto a transferir: ${totalVes ? formatVes(totalVes) : "Pendiente de tasa BCV"}`,
      ];
    case "zelle":
      return [
        "Solicita por WhatsApp los datos de Zelle actualizados antes de pagar",
        "Referencia de Zona Audio: +58 412-8050526",
      ];
    case "binance":
      return [
        "Escanea el código QR con la aplicación de Binance para pagar",
        "ID de Binance Pay: 198712776",
        "Usuario: User-00a06",
        "Correo: Mendezl652@gmail.com",
      ];
    case "efectivo":
    default:
      return [
        "Paga en divisas al recoger tu pedido en la tienda",
        "Dirección: Av. Andrés Bello, Edificio Centro Andrés Bello - Torre Oeste, piso 3, oficina 34-O",
        "Horario: lunes a sábado, de 10:00 a. m. a 5:00 p. m.",
      ];
  }
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [customer, setCustomer] = useState<CustomerDetails>(EMPTY_CUSTOMER);
  const [payment, setPayment] = useState<PaymentDetails>(EMPTY_PAYMENT);
  const [proofError, setProofError] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [submittedOrder, setSubmittedOrder] = useState<SubmittedOrder | null>(null);
  const orderSequence = useRef(100000);
  const { rate, isLoading: rateLoading, error: rateError } = useBcvRate();

  const {
    items,
    getSubtotal,
    getDiscount,
    getShipping,
    getTotal,
    couponCode,
    clearCart,
  } = useCartStore();

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shipping = getShipping();
  const baseTotal = getTotal();
  const paymentDiscount = payment.mode === "divisas" ? subtotal * 0.14 : 0;
  const total = Math.max(0, baseTotal - paymentDiscount);
  const totalVes = payment.mode === "bolivares" && rate > 0 ? total * rate : null;
  const cartCurrency: ProductCurrency = "USD";
  const currentPayment =
    PAYMENT_METHODS.find((option) => option.id === payment.method) ??
    PAYMENT_METHODS[0];
  const paymentInstructions = getPaymentInstructions(payment.method, totalVes);

  const resetCheckout = () => {
    setStep(1);
    setIsProcessing(false);
    setOrderNumber("");
    setCopiedOrder(false);
    setCustomer(EMPTY_CUSTOMER);
    setPayment(EMPTY_PAYMENT);
    setProofError("");
    setWhatsappUrl("");
    setSubmittedOrder(null);
  };

  const handleClose = () => {
    resetCheckout();
    onClose();
  };

  const updateCustomer = (
    field: keyof CustomerDetails,
    value: string
  ) => {
    setCustomer((current) => ({ ...current, [field]: value }));
  };

  const handleNextToPayment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStep(2);
  };

  const handleProofChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    setPayment((current) => ({
      ...current,
      proofName: file?.name ?? "",
    }));
    setProofError("");
  };

  const buildOrderMessage = (reference: string) => {
    const itemLines = items.map(({ product }) => `* ${product.name}`);
    const money = (amount: number) =>
      formatMoney(amount, cartCurrency, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    return [
      "PEDIDO NUEVO",
      `Nombre y apellido: ${customer.fullName}`,
      `Cédula de identidad / RIF: ${customer.idNumber}`,
      `Teléfono: ${customer.phone}`,
      "",
      "PRODUCTOS",
      ...itemLines,
      "",
      `Total en USD: ${money(total)}`,
      "",
      "PAGO",
      `Modalidad: ${payment.mode === "divisas" ? "Pago en divisas" : "Pago en bolívares"}`,
      `Comprobante: ${payment.proofName || reference || "No adjunto"}`,
    ].join("\n");
  };

  const handleConfirmOrder = () => {
    const reference = payment.reference.trim();
    if (!reference && !payment.proofName) {
      setProofError(
        "Ingresa una referencia o adjunta una foto del comprobante para continuar."
      );
      return;
    }
    if (items.length === 0) return;
    if (payment.mode === "bolivares" && rate <= 0) {
      setProofError("No se pudo obtener la tasa BCV. Actualiza la tasa antes de pagar en bolívares.");
      return;
    }

    setIsProcessing(true);
    orderSequence.current += 1;
    const generatedOrderNumber = `AURA-${orderSequence.current}`;
    setOrderNumber(generatedOrderNumber);

    const message = buildOrderMessage(reference);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    setWhatsappUrl(url);
    setSubmittedOrder({
      orderNumber: generatedOrderNumber,
      customerName: customer.fullName,
      paymentLabel: currentPayment.label,
      total: formatMoney(total, cartCurrency, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      totalVes:
        payment.mode === "bolivares" && totalVes ? formatVes(totalVes) : null,
      whatsappUrl: url,
    });

    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      // El enlace de WhatsApp queda disponible en la pantalla de confirmación.
    }

    try {
      confetti({
        particleCount: 110,
        spread: 75,
        origin: { y: 0.6 },
        colors: ["#d47217", "#d47217", "#d47217", "#d47217", "#FFFFFF"],
      });
    } catch {
      // La celebración es opcional.
    }

    clearCart();
    setStep(3);
    setIsProcessing(false);
  };

  const copyOrderToClipboard = async () => {
    if (!orderNumber) return;
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopiedOrder(true);
      setTimeout(() => setCopiedOrder(false), 2000);
    } catch {
      setCopiedOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        className="relative w-full max-w-3xl bg-[#121212] border border-[#d47217]/25 rounded-3xl overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-200 text-[#FFFFFF] my-auto max-h-[94vh] flex flex-col"
      >
        <div className="p-5 sm:p-6 border-b border-[#3F3F46] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d47217]/20 text-[#d47217] flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="checkout-title"
                className="text-base font-black uppercase tracking-wider flex items-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5 text-[#d47217]" /> Checkout Zona Audio
              </h2>
              <span className="text-xs text-[#e3deda]">
                Pago manual y confirmación por WhatsApp
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            title="Cerrar checkout"
            aria-label="Cerrar checkout"
            className="p-2 rounded-xl text-[#e3deda] hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step < 3 && (
          <div className="px-5 sm:px-6 py-3 bg-[#27272A]/70 border-b border-[#3F3F46] flex items-center justify-between text-xs">
            <div
              className={`flex items-center gap-2 font-bold ${
                step >= 1 ? "text-[#d47217]" : "text-[#e3deda]"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-[#d47217]/20 flex items-center justify-center text-[11px] border border-[#d47217]/40 text-[#d47217]">
                1
              </span>
              <span>Datos y envío</span>
            </div>
            <div className="h-0.5 w-12 bg-[#3F3F46]" />
            <div
              className={`flex items-center gap-2 font-bold ${
                step >= 2 ? "text-[#d47217]" : "text-[#e3deda]"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-[#d47217]/20 flex items-center justify-center text-[11px] border border-[#d47217]/40 text-[#d47217]">
                2
              </span>
              <span>Pago y comprobante</span>
            </div>
          </div>
        )}

        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {step === 1 && (
            <form onSubmit={handleNextToPayment} className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#e3deda]">
                  Datos del cliente
                </h3>
                <p className="text-xs text-[#e3deda] mt-1">
                  Completa todos los campos obligatorios para preparar tu pedido.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="checkout-name" className="text-xs text-[#e3deda] font-medium">
                    Nombre y apellido *
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={customer.fullName}
                    onChange={(e) => updateCustomer("fullName", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#27272A] border border-[#52525B] text-sm text-[#FFFFFF] focus:border-[#d47217] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="checkout-id" className="text-xs text-[#e3deda] font-medium">
                    Cédula de identidad / RIF *
                  </label>
                  <input
                    id="checkout-id"
                    type="text"
                    required
                    value={customer.idNumber}
                    onChange={(e) => updateCustomer("idNumber", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#27272A] border border-[#52525B] text-sm text-[#FFFFFF] focus:border-[#d47217] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="checkout-phone" className="text-xs text-[#e3deda] font-medium">
                    Teléfono de contacto *
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    inputMode="tel"
                    required
                    autoComplete="tel"
                    placeholder="0412-0000000"
                    value={customer.phone}
                    onChange={(e) => updateCustomer("phone", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#27272A] border border-[#52525B] text-sm text-[#FFFFFF] focus:border-[#d47217] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="checkout-email" className="text-xs text-[#e3deda] font-medium">
                    Correo electrónico (opcional)
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    autoComplete="email"
                    value={customer.email}
                    onChange={(e) => updateCustomer("email", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#27272A] border border-[#52525B] text-sm text-[#FFFFFF] focus:border-[#d47217] outline-none"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label htmlFor="checkout-address" className="text-xs text-[#e3deda] font-medium">
                    Dirección de entrega *
                  </label>
                  <input
                    id="checkout-address"
                    type="text"
                    required
                    autoComplete="street-address"
                    value={customer.address}
                    onChange={(e) => updateCustomer("address", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#27272A] border border-[#52525B] text-sm text-[#FFFFFF] focus:border-[#d47217] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="checkout-city" className="text-xs text-[#e3deda] font-medium">
                    Ciudad *
                  </label>
                  <input
                    id="checkout-city"
                    type="text"
                    required
                    autoComplete="address-level2"
                    value={customer.city}
                    onChange={(e) => updateCustomer("city", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#27272A] border border-[#52525B] text-sm text-[#FFFFFF] focus:border-[#d47217] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#e3deda]">
                    Modalidad de pago
                  </h3>
                  <p className="text-xs text-[#e3deda] mt-1">
                    Selecciona cómo realizarás el pago. Te mostraremos las instrucciones y el monto exacto.
                  </p>
                </div>
                <div
                  role="radiogroup"
                  aria-label="Modalidad de pago"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={payment.mode === "divisas"}
                    onClick={() => setPayment((current) => ({ ...current, mode: "divisas", method: "efectivo" }))}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      payment.mode === "divisas"
                        ? "bg-[#d47217]/20 text-[#d47217] border-[#d47217]/50"
                        : "bg-[#27272A] text-[#e3deda] border-[#52525B] hover:border-[#d47217]/60"
                    }`}
                  >
                    <span className="block text-xs font-bold">Pago en divisas</span>
                    <span className="block text-[11px] opacity-75 mt-1">Efectivo, Zelle o Binance Pay</span>
                    <span className="inline-flex mt-2 rounded-full bg-[#25D366]/15 px-2 py-0.5 text-[10px] font-bold text-[#7EE2A1]">14% de descuento</span>
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={payment.mode === "bolivares"}
                    onClick={() => setPayment((current) => ({ ...current, mode: "bolivares", method: "pago_movil" }))}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      payment.mode === "bolivares"
                        ? "bg-[#d47217]/20 text-[#d47217] border-[#d47217]/50"
                        : "bg-[#27272A] text-[#e3deda] border-[#52525B] hover:border-[#d47217]/60"
                    }`}
                  >
                    <span className="block text-xs font-bold">Pago en bolívares</span>
                    <span className="block text-[11px] opacity-75 mt-1">Pago Móvil o transferencia</span>
                    <span className="inline-flex mt-2 rounded-full bg-[#d47217]/10 px-2 py-0.5 text-[10px] font-bold text-[#d47217]">Tasa BCV del día</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#e3deda]">
                  Método de pago
                </h3>
                <div
                  role="radiogroup"
                  aria-label="Método de pago"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {PAYMENT_METHODS.filter((option) => option.mode === payment.mode).map((option) => {
                    const Icon = option.icon;
                    const selected = payment.method === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setPayment((current) => ({ ...current, mode: option.mode, method: option.id }))}
                        className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                          selected
                            ? "bg-[#d47217]/20 text-[#d47217] border-[#d47217]/50"
                            : "bg-[#27272A] text-[#e3deda] border-[#52525B] hover:border-[#d47217]/60"
                        }`}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span>
                          <span className="block text-xs font-bold">{option.label}</span>
                          <span className="block text-[11px] opacity-75">{option.description}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#27272A]/80 border border-[#52525B] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#d47217]/15 text-[#d47217]">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#FFFFFF]">
                      Entrega y preparación del pedido
                    </div>
                    <div className="text-[11px] text-[#e3deda]">
                      Confirmaremos la coordinación por WhatsApp
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono text-[#d47217] shrink-0">
                  {shipping === 0
                    ? "GRATIS"
                    : formatMoney(shipping, cartCurrency, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#d47217] via-[#d47217] to-[#d47217] hover:opacity-95 text-white font-black text-sm transition-all shadow-xl shadow-[#d47217]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continuar a instrucciones de pago</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#e3deda]">
                  Instrucciones de {currentPayment.label}
                </h3>
                <p className="text-xs text-[#e3deda] mt-1">
                  Realiza el pago y conserva tu referencia o comprobante para enviarlo con el pedido.
                </p>
              </div>

              {payment.mode === "bolivares" && (
                <div className="p-3.5 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-between gap-3 text-xs">
                  <span className="text-[#e3deda]">Tasa oficial BCV del día</span>
                  <span className="font-mono font-bold text-[#7EE2A1]">
                    {rateLoading
                      ? "Consultando..."
                      : rateError || rate <= 0
                        ? "No disponible"
                        : `Bs. ${rate.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} / USD`}
                  </span>
                </div>
              )}
              {payment.mode === "bolivares" && (rateError || rate <= 0) && (
                <p role="alert" className="text-xs text-[#d47217] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> No se puede calcular el monto en bolívares hasta obtener la tasa BCV.
                </p>
              )}

              <div className="p-4 rounded-2xl bg-[#27272A]/80 border border-[#d47217]/35 space-y-3">
                <div className="flex items-start gap-2 text-xs text-[#FFFFFF] font-semibold">
                  <AlertCircle className="w-4 h-4 text-[#d47217] shrink-0 mt-0.5" />
                  <span>{currentPayment.description}</span>
                </div>
                <ul className="space-y-2 text-xs text-[#e3deda] list-disc pl-5">
                  {paymentInstructions.map((instruction) => (
                    <li key={instruction}>{instruction}</li>
                  ))}
                </ul>
              </div>

              {payment.method === "binance" && (
                <div className="rounded-2xl border border-[#d47217]/35 bg-[#27272A] p-4 space-y-4">
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-bold text-[#d47217]">
                      Escanea con la app de Binance para pagar
                    </h4>
                    <p className="text-xs text-[#e3deda]">
                      Abre Binance Pay, selecciona escanear QR y confirma el pago.
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Image
                      src="/products/binance-pay-qr.png"
                      alt="Código QR de Binance Pay de Zona Audio"
                      width={1000}
                      height={1100}
                      className="w-full max-w-[280px] h-auto rounded-xl border border-[#d47217]/30"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="rounded-xl bg-[#27272A] border border-[#52525B] p-2.5">
                      <span className="block text-[10px] uppercase tracking-wider text-[#e3deda]">ID</span>
                      <strong className="font-mono text-[#FFFFFF]">198712776</strong>
                    </div>
                    <div className="rounded-xl bg-[#27272A] border border-[#52525B] p-2.5">
                      <span className="block text-[10px] uppercase tracking-wider text-[#e3deda]">Usuario</span>
                      <strong className="font-mono text-[#FFFFFF]">User-00a06</strong>
                    </div>
                    <div className="rounded-xl bg-[#27272A] border border-[#52525B] p-2.5 min-w-0">
                      <span className="block text-[10px] uppercase tracking-wider text-[#e3deda]">Correo</span>
                      <strong className="font-mono text-[#FFFFFF] break-all">Mendezl652@gmail.com</strong>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="checkout-reference" className="text-xs text-[#e3deda] font-medium">
                    Número de referencia
                  </label>
                  <input
                    id="checkout-reference"
                    type="text"
                    value={payment.reference}
                    onChange={(e) => {
                      setPayment((current) => ({ ...current, reference: e.target.value }));
                      setProofError("");
                    }}
                    placeholder="Ej.: 123456"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#27272A] border border-[#52525B] text-sm text-[#FFFFFF] focus:border-[#d47217] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="checkout-proof" className="text-xs text-[#e3deda] font-medium">
                    Foto o captura del comprobante
                  </label>
                  <label
                    htmlFor="checkout-proof"
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#27272A] border border-[#52525B] text-xs text-[#e3deda] cursor-pointer hover:border-[#d47217]/60"
                  >
                    <Upload className="w-4 h-4 text-[#d47217]" />
                    <span className="truncate">
                      {payment.proofName || "Seleccionar imagen o PDF"}
                    </span>
                    <input
                      id="checkout-proof"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleProofChange}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
              <p className="text-[11px] text-[#e3deda] flex items-start gap-1.5">
                <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                Adjunta la imagen o ingresa una referencia. El nombre del comprobante se incluirá en el mensaje de WhatsApp.
              </p>
              {proofError && (
                <p role="alert" className="text-xs text-[#d47217] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> {proofError}
                </p>
              )}

              <div className="p-4 rounded-2xl bg-[#27272A]/40 border border-[#3F3F46] space-y-2 text-xs">
                <div className="flex justify-between text-[#e3deda]">
                  <span>Subtotal ({items.length} {items.length === 1 ? "artículo" : "artículos"})</span>
                  <span className="font-mono text-[#FFFFFF]">
                    {formatMoney(subtotal, cartCurrency, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#d47217]">
                    <span>Descuento ({couponCode})</span>
                    <span className="font-mono">
                      -{formatMoney(discount, cartCurrency, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-[#e3deda]">
                  <span>Envío</span>
                  <span className="font-mono text-[#FFFFFF]">
                    {shipping === 0
                      ? "GRATIS"
                      : formatMoney(shipping, cartCurrency, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {paymentDiscount > 0 && (
                  <div className="flex justify-between text-[#7EE2A1] font-semibold">
                    <span>Descuento pago en divisas (14%)</span>
                    <span className="font-mono">
                      -{formatMoney(paymentDiscount, cartCurrency, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-[#FFFFFF] pt-2 border-t border-[#3F3F46]">
                  <span>Total del pedido</span>
                  <span className="text-[#d47217] font-mono text-xl font-black">
                    {formatMoney(total, cartCurrency, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {payment.mode === "bolivares" && totalVes && (
                  <div className="flex justify-between text-sm font-bold text-[#7EE2A1]">
                    <span>Equivalente a bolívares</span>
                    <span className="font-mono">{formatVes(totalVes)}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-2xl bg-[#27272A] hover:bg-[#27272A] text-[#FFFFFF] font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-[#52525B]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={isProcessing}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#d47217] via-[#d47217] to-[#d47217] hover:opacity-95 text-white font-black text-sm tracking-wide shadow-xl shadow-[#d47217]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#121212] border-t-transparent rounded-full animate-spin" />
                      <span>Preparando pedido...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Confirmar y enviar a WhatsApp</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && submittedOrder && (
            <div className="text-center py-6 space-y-5 animate-in zoom-in duration-300">
              <div className="w-20 h-20 rounded-3xl bg-[#d47217]/20 border border-[#d47217]/35 text-[#d47217] flex items-center justify-center mx-auto shadow-2xl shadow-[#d47217]/30">
                <CheckCircle2 className="w-10 h-10 text-[#d47217]" />
              </div>

              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-[#d47217]">
                  Pedido preparado
                </span>
                <h3 className="text-2xl font-black text-[#FFFFFF] mt-1">
                  ¡Gracias, {submittedOrder.customerName}!
                </h3>
                <p className="text-xs text-[#e3deda] mt-1 max-w-md mx-auto">
                  Tu pedido fue generado. Si WhatsApp no se abrió automáticamente, usa el enlace para enviarlo al número de Zona Audio.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#27272A] border border-[#52525B] max-w-sm mx-auto flex items-center justify-between text-xs">
                <div className="text-left">
                  <span className="text-[10px] text-[#e3deda] uppercase font-bold block">
                    ID del pedido
                  </span>
                  <span className="font-mono font-bold text-[#d47217] text-base">
                    {submittedOrder.orderNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={copyOrderToClipboard}
                  className="px-3 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-xs text-[#e3deda] flex items-center gap-1 cursor-pointer border border-[#52525B]"
                >
                  {copiedOrder ? <Check className="w-3.5 h-3.5 text-[#d47217]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedOrder ? "¡Copiado!" : "Copiar ID"}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#27272A]/60 border border-[#3F3F46] text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="font-bold text-[#FFFFFF]">Resumen del pedido</div>
                <div className="text-[#e3deda]">
                  Método: <span className="text-[#d47217]">{submittedOrder.paymentLabel}</span>
                </div>
                <div className="text-[#e3deda]">
                  Total generado: <span className="text-[#d47217]">{submittedOrder.total}</span>
                </div>
                {submittedOrder.totalVes && (
                  <div className="text-[#e3deda]">
                    Equivalente: <span className="text-[#7EE2A1]">{submittedOrder.totalVes}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <a
                  href={whatsappUrl || submittedOrder.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl bg-[#d47217] hover:bg-[#d47217] text-white font-bold text-xs shadow-lg shadow-[#d47217]/20 cursor-pointer"
                >
                  Abrir WhatsApp
                </a>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-3 rounded-xl bg-[#27272A] hover:bg-[#27272A] text-[#FFFFFF] font-bold text-xs border border-[#52525B] cursor-pointer"
                >
                  Volver a la tienda
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
