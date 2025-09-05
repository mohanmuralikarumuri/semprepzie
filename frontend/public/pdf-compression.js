// PDF Compression Service Worker Extension
// Add this to your service worker for PDF compression

// Compress PDF responses before caching
async function compressPDFResponse(response) {
  // Only compress if browser supports compression
  if (!('CompressionStream' in window)) {
    return response;
  }

  try {
    const arrayBuffer = await response.arrayBuffer();
    
    // Only compress if PDF is larger than 1MB
    if (arrayBuffer.byteLength < 1024 * 1024) {
      return new Response(arrayBuffer, {
        headers: response.headers,
        status: response.status,
        statusText: response.statusText
      });
    }

    // Compress using gzip
    const compressionStream = new CompressionStream('gzip');
    const compressedStream = new ReadableStream({
      start(controller) {
        const writer = compressionStream.writable.getWriter();
        writer.write(new Uint8Array(arrayBuffer));
        writer.close();
      }
    }).pipeThrough(compressionStream);

    const compressedArrayBuffer = await new Response(compressedStream).arrayBuffer();
    
    // Create new response with compression headers
    const compressedResponse = new Response(compressedArrayBuffer, {
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'content-encoding': 'gzip',
        'x-compressed-size': compressedArrayBuffer.byteLength.toString(),
        'x-original-size': arrayBuffer.byteLength.toString()
      },
      status: response.status,
      statusText: response.statusText
    });

    console.log(`[SW] PDF compressed: ${arrayBuffer.byteLength} → ${compressedArrayBuffer.byteLength} bytes (${Math.round((1 - compressedArrayBuffer.byteLength / arrayBuffer.byteLength) * 100)}% reduction)`);
    
    return compressedResponse;
  } catch (error) {
    console.warn('[SW] PDF compression failed, using original:', error);
    return response;
  }
}

// Decompress PDF when serving from cache
async function decompressPDFResponse(response) {
  if (!response.headers.get('content-encoding')?.includes('gzip')) {
    return response;
  }

  try {
    const compressedArrayBuffer = await response.arrayBuffer();
    const decompressionStream = new DecompressionStream('gzip');
    
    const decompressedStream = new ReadableStream({
      start(controller) {
        const writer = decompressionStream.writable.getWriter();
        writer.write(new Uint8Array(compressedArrayBuffer));
        writer.close();
      }
    }).pipeThrough(decompressionStream);

    const decompressedArrayBuffer = await new Response(decompressedStream).arrayBuffer();
    
    // Create response without compression headers
    const headers = new Headers(response.headers);
    headers.delete('content-encoding');
    headers.delete('x-compressed-size');
    headers.set('content-length', decompressedArrayBuffer.byteLength.toString());

    return new Response(decompressedArrayBuffer, {
      headers,
      status: response.status,
      statusText: response.statusText
    });
  } catch (error) {
    console.warn('[SW] PDF decompression failed:', error);
    return response;
  }
}
