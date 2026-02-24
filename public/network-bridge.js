// network-bridge.js - Lovivo Network Request Capture Bridge
(function() {
  // Solo ejecutar si estamos dentro de un iframe
  if (window.self === window.top) return;
  
  // Función para enviar datos de red al parent window
  function sendNetworkToParent(data) {
    try {
      window.parent.postMessage({
        source: 'lovivo-preview-bridge',
        level: 'network',
        data: data,
        timestamp: new Date().toISOString()
      }, '*');
    } catch (err) {
      console.error('Failed to send network log to parent:', err);
    }
  }

  // ============= INTERCEPTAR FETCH API =============
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const startTime = Date.now();
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || 'unknown';
    const options = args[1] || {};
    const method = options.method || 'GET';
    
    // Capturar request body (truncado a 1000 chars)
    let requestBody = null;
    if (options.body) {
      try {
        requestBody = typeof options.body === 'string' 
          ? options.body.substring(0, 1000)
          : JSON.stringify(options.body).substring(0, 1000);
      } catch {}
    }
    
    return originalFetch.apply(this, args)
      .then(async response => {
        const duration = Date.now() - startTime;
        
        // Capturar response body SOLO para errores (4xx/5xx) - clonar para no consumir el stream
        let responseBody = null;
        if (!response.ok) {
          try {
            const cloned = response.clone();
            const text = await cloned.text();
            responseBody = text.substring(0, 2000);
          } catch {}
        }
        
        sendNetworkToParent({
          type: 'fetch',
          url: url,
          method: method,
          status: response.status,
          statusText: response.statusText,
          duration: duration,
          success: response.ok,
          requestBody: requestBody,
          responseBody: responseBody
        });
        
        return response;
      })
      .catch(error => {
        const duration = Date.now() - startTime;
        
        sendNetworkToParent({
          type: 'fetch',
          url: url,
          method: method,
          status: 0,
          statusText: 'Network Error',
          duration: duration,
          error: error.message,
          success: false,
          requestBody: requestBody
        });
        
        throw error;
      });
  };

  // ============= INTERCEPTAR XMLHttpRequest =============
  const OriginalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function() {
    const xhr = new OriginalXHR();
    const requestData = {
      type: 'xhr',
      url: '',
      method: 'GET',
      startTime: 0
    };
    
    // Interceptar open
    const originalOpen = xhr.open;
    xhr.open = function(method, url, ...rest) {
      requestData.method = method;
      requestData.url = url;
      requestData.startTime = Date.now();
      return originalOpen.apply(this, [method, url, ...rest]);
    };
    
    // Interceptar send
    const originalSend = xhr.send;
    xhr.send = function(...args) {
      // Capturar request body (truncado a 1000 chars)
      let requestBody = null;
      if (args[0]) {
        try {
          requestBody = typeof args[0] === 'string'
            ? args[0].substring(0, 1000)
            : JSON.stringify(args[0]).substring(0, 1000);
        } catch {}
      }
      
      // Listener para cuando se complete la petición
      xhr.addEventListener('loadend', function() {
        const duration = Date.now() - requestData.startTime;
        const isError = xhr.status < 200 || xhr.status >= 300;
        
        // Capturar response body SOLO para errores
        let responseBody = null;
        if (isError) {
          try {
            responseBody = (xhr.responseText || '').substring(0, 2000);
          } catch {}
        }
        
        sendNetworkToParent({
          type: 'xhr',
          url: requestData.url,
          method: requestData.method,
          status: xhr.status,
          statusText: xhr.statusText,
          duration: duration,
          success: !isError,
          requestBody: requestBody,
          responseBody: responseBody
        });
      });
      
      return originalSend.apply(this, args);
    };
    
    return xhr;
  };
  
  // Copiar propiedades estáticas
  Object.keys(OriginalXHR).forEach(key => {
    window.XMLHttpRequest[key] = OriginalXHR[key];
  });

  // Log de inicialización
  console.log('🌐 Lovivo Network Bridge initialized');
})();
