import React, { useMemo } from 'react'
import logoSpec from '../../data/logo/logo.json'

export default function LogoQrPreview() {
  const previewText = useMemo(() => logoSpec.qr.text.replace(/\\n/g, '\n'), [])

  return (
    <section aria-label="Logo QR payload preview">
      <h3 style={{ margin: 0 }}>QR Payload</h3>
      <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{previewText}</pre>
    </section>
  )
}
