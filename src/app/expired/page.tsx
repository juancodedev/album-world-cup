'use client';

import Link from 'next/link';

export default function ExpiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
          <span className="text-white text-2xl font-bold">AW</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Acceso suspendido</h1>
        <p className="text-sm text-gray-500">
          Tu período de prueba gratuita ha finalizado. Para seguir usando la plataforma,
          contacta al administrador para coordinar el pago y la habilitación de tu cuenta.
        </p>
        <div className="bg-gray-100 rounded-xl p-4 text-sm text-gray-600">
          <p>Transferencia a:</p>
          <p className="font-bold text-gray-900 mt-1">CL.JMUNOZ@GMAIL.COM</p>
          <p className="text-xs text-gray-400 mt-1">Enviar comprobante al mismo correo</p>
        </div>
        <Link
          href="/login"
          className="inline-block px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
