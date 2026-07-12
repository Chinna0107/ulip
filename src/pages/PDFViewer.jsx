import React, { useState } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const PDFViewer = ({ title, fileUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset) => {
    setPageNumber(prev => Math.min(Math.max(1, prev + offset), numPages));
  };

  const changeScale = (delta) => {
    setScale(prev => Math.min(Math.max(0.5, prev + delta), 3.0));
  };

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 150px)', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title">{title}</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className="btn-secondary" onClick={() => changeScale(-0.2)} title="Zoom Out" style={{ padding: '0.5rem' }}><ZoomOut size={16} /></button>
          <span style={{ fontSize: '0.9rem', width: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{Math.round(scale * 100)}%</span>
          <button className="btn-secondary" onClick={() => changeScale(0.2)} title="Zoom In" style={{ padding: '0.5rem' }}><ZoomIn size={16} /></button>
          
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={16} /> <span className="hide-on-mobile">Download</span>
          </a>
        </div>
      </div>
      
      {/* PDF Container */}
      <div style={{ 
        flex: 1, 
        backgroundColor: 'var(--bg-secondary)', 
        borderRadius: '8px', 
        overflow: 'auto', 
        WebkitOverflowScrolling: 'touch',
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1rem',
        position: 'relative'
      }}>
        <Document 
          file={fileUrl} 
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading PDF...</div>}
          error={<div style={{ padding: '2rem', color: 'var(--error)' }}>Failed to load PDF. Please use the download button.</div>}
        >
          {numPages && (
            <div style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', backgroundColor: 'white' }}>
              <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </div>
          )}
        </Document>

        {/* Pagination Controls Fixed at Bottom */}
        {numPages && (
          <div style={{
            position: 'sticky',
            bottom: '1rem',
            marginTop: '2rem', // Pushes it to the bottom
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            padding: '0.5rem 1rem',
            borderRadius: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            zIndex: 10
          }}>
            <button 
              className="icon-btn" 
              onClick={() => changePage(-1)} 
              disabled={pageNumber <= 1}
              style={{ opacity: pageNumber <= 1 ? 0.5 : 1, color: 'var(--text-primary)' }}
            >
              <ChevronLeft size={20} />
            </button>
            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-primary)' }}>
              Page {pageNumber} of {numPages}
            </span>
            <button 
              className="icon-btn" 
              onClick={() => changePage(1)} 
              disabled={pageNumber >= numPages}
              style={{ opacity: pageNumber >= numPages ? 0.5 : 1, color: 'var(--text-primary)' }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
