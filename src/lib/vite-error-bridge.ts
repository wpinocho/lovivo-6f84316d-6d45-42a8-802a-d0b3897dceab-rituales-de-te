// vite-error-bridge.ts - Captura errores de compilación de Vite HMR
// Envía errores por DOS canales:
// 1. HTTP POST a Edge Function (SIEMPRE - garantiza que no se pierda)
// 2. postMessage al parent (si hay iframe - para feedback rápido)

import { STORE_ID } from './config';

// URL de la Edge Function para reportar errores
const SANDBOX_ERROR_REPORT_URL = 'https://ptgmltivisbtvmoxwnhd.supabase.co/functions/v1/sandbox-error-report';

if (import.meta.hot) {
  // Escuchar errores de Vite (compilación, sintaxis, imports rotos, etc.)
  import.meta.hot.on('vite:error', async (payload: any) => {
    const errorData = {
      source: 'lovivo-preview-bridge',
      type: 'vite:error',
      level: 'error',
      error: {
        message: payload.err?.message || payload.message || 'Unknown Vite error',
        stack: payload.err?.stack,
        file: payload.err?.loc?.file || payload.err?.id,
        line: payload.err?.loc?.line,
        column: payload.err?.loc?.column,
        frame: payload.err?.frame,  // Código con el error señalado
        plugin: payload.err?.plugin  // Plugin que detectó el error
      },
      timestamp: new Date().toISOString()
    };
    
    // CANAL 1: HTTP POST a Edge Function (SIEMPRE - garantiza persistencia)
    // Esto asegura que el error se guarde aunque el usuario cierre el navegador
    if (STORE_ID) {
      try {
        const response = await fetch(SANDBOX_ERROR_REPORT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            store_id: STORE_ID,
            error: errorData.error,
            timestamp: errorData.timestamp
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.deduplicated) {
            console.log('🔄 Error already reported, skipping duplicate');
          } else {
            console.log('📤 Error reported to fixer, job_id:', result.job_id);
          }
        } else {
          console.error('❌ Failed to report error to server:', response.status);
        }
      } catch (e) {
        console.error('❌ Failed to report error to server:', e);
      }
    }
    
    // CANAL 2: postMessage al parent (si hay iframe - para feedback rápido en UI)
    if (window.parent !== window) {
      window.parent.postMessage(errorData, '*');
    }
    
    // También loguear para que console-bridge lo capture
    console.error('🔴 Vite Compilation Error:', errorData.error.message);
  });

  // Escuchar cuando Vite se recupera de un error
  import.meta.hot.on('vite:beforeUpdate', () => {
    if (window.parent !== window) {
      window.parent.postMessage({
        source: 'lovivo-preview-bridge',
        type: 'vite:updating',
        timestamp: new Date().toISOString()
      }, '*');
    }
  });

  import.meta.hot.on('vite:afterUpdate', () => {
    if (window.parent !== window) {
      window.parent.postMessage({
        source: 'lovivo-preview-bridge',
        type: 'vite:updated',
        timestamp: new Date().toISOString()
      }, '*');
    }
  });

  console.log('🔌 Vite Error Bridge initialized (dual-channel: HTTP + postMessage)');
}

export {};
