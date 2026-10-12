import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, AlertCircle, ArrowLeft, MessageCircle } from "lucide-react";
import { buildWhatsAppUrl, CONTACT_PHONE } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Resultado de tu pago | Zona Audio",
  description:
    "Consulta el estado de tu pago en Zona Audio, tienda de audio en Caracas.",
  alternates: { canonical: "/cashea/retorno" },
  // Esta pagina es personal: no debe indexarse ni compartirse.
  robots: { index: false, follow: false },
};

/**
 * Destino de Cashea despues del pago.
 *
 * Cashea redirige aqui con ?idNumber=... cuando el cliente intenta pagar.
 * La pagina es informativa: el estado final lo confirma Cashea en su
 * plataforma y Zona Audio lo verifica al recibir la notificacion.
 */
export default async function RetornoCashea({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const idNumber = leerParam(params.idNumber);
  const status = leerParam(params.status);

  const cancelado =
    status === "cancelled" || status === "canceled" || status === "CANCELLED";

  return (
    <main className="min-h-screen bg-[#121212] text-[#FFFFFF]">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center">
        <div
          className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
            cancelado
              ? "bg-[#e3deda]/10 text-[#e3deda]"
              : "bg-[#7EE2A1]/15 text-[#7EE2A1]"
          }`}
        >
          {cancelado ? (
            <AlertCircle className="h-10 w-10" />
          ) : (
            <CheckCircle2 className="h-10 w-10" />
          )}
        </div>

        <h1 className="text-3xl font-black sm:text-4xl">
          {cancelado ? "Pago cancelado" : "Revisamos tu pago"}
        </h1>

        <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#e3deda]">
          {cancelado ? (
            <>
              Tu pago fue cancelado y no se realizó ningún cobro. Si fue un
              error, puedes volver al carrito e intentar de nuevo cuando quieras.
            </>
          ) : (
            <>
              Registramos tu solicitud de pago. Tu pedido entra en cola y te
              confirmamos por WhatsApp en los próximos minutos con los datos
              exactos para completar la entrega.
            </>
          )}
        </p>

        {idNumber && (
          <div className="mt-8 w-full max-w-sm rounded-2xl border border-[#3F3F46] bg-[#27272A] p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d47217]">
              Referencia del pago
            </p>
            <p className="mt-2 font-mono text-xl font-black break-all">
              {idNumber}
            </p>
            <p className="mt-3 text-xs text-[#e3deda]">
              Guarda este número. Lo usaremos para localizar tu pedido.
            </p>
          </div>
        )}

        <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
          <a
            href={buildWhatsAppUrl(
              idNumber
                ? `¡Hola! acabo de pagar en Zona Audio con la referencia ${idNumber}. Quiero confirmar mi pedido.`
                : "¡Hola! vengo de la página de Zona Audio y quiero confirmar mi pedido."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-[#25D366]/25 transition hover:opacity-95"
          >
            <MessageCircle className="h-4 w-4" />
            Confirmar por WhatsApp
          </a>

          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#52525B] bg-[#27272A] px-5 py-3.5 text-sm font-bold transition hover:border-[#d47217] hover:text-[#d47217]"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la tienda
          </Link>
        </div>

        <p className="mt-8 text-xs text-[#e3deda]">
          ¿Algún problema? Escríbenos al {CONTACT_PHONE}.
        </p>
      </div>
    </main>
  );
}

function leerParam(valor: string | string[] | undefined): string {
  if (Array.isArray(valor)) return valor[0]?.trim() ?? "";
  return valor?.trim() ?? "";
}
