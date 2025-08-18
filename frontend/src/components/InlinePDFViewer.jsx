import React, { useEffect, useRef, useCallback } from 'react';

// Inline Adobe PDF viewer embedded in center panel
// Props:
// - file: { file: File, name, id, size, type }
// - onSelection: (payload: { text, page, position }) => void
// - onApisReady: (apis) => void  // optional, to control zoom etc from parent
// - clientId?: string            // optional override
// - containerId?: string         // unique DOM id for the viewer container
// Added onGenerateInsights: also send selection to Insights automatically
const InlinePDFViewer = ({ file, onSelection, onGenerateInsights, onApisReady, clientId, containerId }) => {
  const containerRef = useRef(null);
  const viewRef = useRef(null);
  const apisRef = useRef(null);
  const intervalRef = useRef(null);
  const lastTextRef = useRef('');            // last observed text from this tick
  const lastEmittedRef = useRef('');         // last text we fired onSelection for
  const stableCountRef = useRef(0);          // how many consecutive polls the same text was seen
  const checkingRef = useRef(false);
  const mouseupTimeoutRef = useRef(null);
  const iframeClickHookedRef = useRef(false);
  const gestureIdRef = useRef(0);            // increments every new selection gesture (mousedown)
  const emittedGestureIdRef = useRef(-1);    // gesture id for which we already emitted

  const ADOBE_CLIENT_ID = clientId || 'c0598f2728bf431baecd93928d677adc';

  const cleanup = useCallback(() => {
    if (mouseupTimeoutRef.current) {
      clearTimeout(mouseupTimeoutRef.current);
      mouseupTimeoutRef.current = null;
    }
    const el = containerRef.current;
    if (el) el.innerHTML = '';
    viewRef.current = null;
    apisRef.current = null;
    lastTextRef.current = '';
    lastEmittedRef.current = '';
    stableCountRef.current = 0;
    checkingRef.current = false;
    iframeClickHookedRef.current = false;
  gestureIdRef.current = 0;
  emittedGestureIdRef.current = -1;
  // no popup
  }, []);

  const resetSelectionEmission = useCallback(() => {
    // Allow next selection to emit even if text is the same
  lastEmittedRef.current = '';
  lastTextRef.current = '';
  stableCountRef.current = 0;
  checkingRef.current = false;
  gestureIdRef.current += 1; // new gesture
  }, []);

  const hookIframeMouseDownReset = useCallback(() => {
    if (iframeClickHookedRef.current) return;
    const container = containerRef.current;
    if (!container) return;
    const iframe = container.querySelector('iframe');
    if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
    const handler = () => { resetSelectionEmission(); };
      try {
        iframe.contentWindow.document.addEventListener('mousedown', handler);
        iframeClickHookedRef.current = true;
      } catch {}
    }
  }, [resetSelectionEmission]);

  const checkSelection = useCallback(() => {
    const apis = apisRef.current;
    if (!apis || checkingRef.current) return;
    checkingRef.current = true;

    apis.getSelectedContent()
      .then((res) => {
        const hasText = res && res.type === 'text' && res.data && res.data.trim().length > 2;
        if (!hasText) {
          lastTextRef.current = '';
          stableCountRef.current = 0;
          lastEmittedRef.current = '';
          checkingRef.current = false;
          // selection cleared; nothing to show
          return;
        }
        const text = res.data.trim();
        if (text === lastTextRef.current) {
          stableCountRef.current = Math.min(stableCountRef.current + 1, 5);
        } else {
          stableCountRef.current = 1;
          lastTextRef.current = text;
        }
  // Emit when selection is stable and either it's a new gesture or text changed since last emit
  if (stableCountRef.current >= 2 && (emittedGestureIdRef.current !== gestureIdRef.current || lastEmittedRef.current !== text)) {
          lastEmittedRef.current = text;
          emittedGestureIdRef.current = gestureIdRef.current;
          apis.getCurrentPage().then((page) => {
            const position = { x: window.innerWidth / 2, y: 120 };
            onSelection && onSelection({ text, page, position });
            // Also send to insights (without switching tabs)
            onGenerateInsights && onGenerateInsights({ text, page });
            checkingRef.current = false;
          }).catch(() => {
            onSelection && onSelection({ text, page: 1, position: { x: window.innerWidth / 2, y: 120 } });
            onGenerateInsights && onGenerateInsights({ text, page: 1 });
            checkingRef.current = false;
          });
          return;
        }
        checkingRef.current = false;
      })
      .catch(() => {
        checkingRef.current = false;
      });
  }, [onSelection, onGenerateInsights]);

  useEffect(() => {
    if (!file || !containerRef.current) return;
    cleanup();

  const render = () => {
      const view = new window.AdobeDC.View({
        clientId: ADOBE_CLIENT_ID,
    divId: containerId || 'adobe-pdf-viewer-inline',
      });
      viewRef.current = view;

      const content = { promise: file.file.arrayBuffer() };
      const metaData = { fileName: file.name };
      const viewerConfig = {
        embedMode: 'FULL_WINDOW',
        defaultViewMode: 'FIT_WIDTH',
        showDownloadPDF: true,
        showPrintPDF: true,
        showAnnotationTools: true,
        enableTextSelection: true,
        enableSearchAPIs: true,
      };

    const previewPromise = view.previewFile({ content, metaData }, viewerConfig);
      previewPromise.then((adobeViewer) => {
        adobeViewer.getAPIs().then((apis) => {
          apisRef.current = apis;
          if (onApisReady) onApisReady(apis);
          // Start polling with stability gating
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = setInterval(checkSelection, 500);
          // Try to hook iframe events early
          setTimeout(() => hookIframeMouseDownReset(), 300);
        });
      }).catch((e) => console.error('Inline viewer failed:', e));
    };

    if (window.AdobeDC) {
      render();
    } else {
      const onReady = () => render();
      document.addEventListener('adobe_dc_view_sdk.ready', onReady, { once: true });
    }

    // Also hook events on the container to reset emission per new user drag/selection
    const cont = containerRef.current;
    const onMouseDownLocal = () => {
      resetSelectionEmission();
      // keep popup for now; it will be repositioned/hidden by polling if selection changes
    };
    const onMouseUpLocal = () => {
      // let polling catch up; nothing else
    };
    cont?.addEventListener('mousedown', onMouseDownLocal);
    cont?.addEventListener('mouseup', onMouseUpLocal);

  const onBlur = () => {};
    window.addEventListener('blur', onBlur);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      cont?.removeEventListener('mousedown', onMouseDownLocal);
      cont?.removeEventListener('mouseup', onMouseUpLocal);
    window.removeEventListener('blur', onBlur);
      cleanup();
    };
  }, [file, cleanup, checkSelection, resetSelectionEmission, hookIframeMouseDownReset]);

  return (
  <div className="w-full h-full">
      <div
        ref={containerRef}
        id={containerId || 'adobe-pdf-viewer-inline'}
        className="w-full h-full"
        style={{ height: '100%' }}
      />
    </div>
  );
};

export default InlinePDFViewer;
