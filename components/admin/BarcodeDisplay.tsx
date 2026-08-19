'use client';
import { useEffect, useRef } from 'react';

export function BarcodeDisplay({ value, height = 50 }: { value: string; height?: number }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    import('jsbarcode').then(({ default: JsBarcode }) => {
      try {
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          width: 1.5,
          height,
          displayValue: true,
          fontSize: 10,
          margin: 4,
          background: '#ffffff',
          lineColor: '#000000',
        });
      } catch (_) {}
    });
  }, [value, height]);

  return <svg ref={svgRef} style={{ width: '100%', display: 'block' }} />;
}
