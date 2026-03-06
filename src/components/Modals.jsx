import React from "react";
import "../css/Modals.css";

export default function Modals({
  viewingDocument,
  setViewingDocument,
  modalConfig,
  setModalConfig,
}) {
  // HELPER: Formats the URL so Multer uploads display correctly
  const getFullUrl = (url) => {
    if (!url) return "";
    // If it's an external image (Unsplash) or a temporary browser blob, return it as-is
    if (
      url.startsWith("http") ||
      url.startsWith("blob:") ||
      url.startsWith("data:")
    ) {
      return url;
    }
    // If it's a relative path from our backend (e.g., 'uploads/file.pdf'), attach the server address
    // We also replace backslashes with forward slashes in case you are on Windows
    const cleanPath = url.replace(/\\/g, "/");
    return `http://localhost:5000/${cleanPath}`;
  };

  return (
    <>
      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div
          className="modal-overlay doc-viewer-overlay"
          onClick={() => setViewingDocument(null)}
        >
          <div
            className="doc-viewer-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewingDocument(null)}
              className="btn-close-modal"
            >
              Close (X)
            </button>

            {viewingDocument.type === "application/pdf" ? (
              <iframe
                src={getFullUrl(viewingDocument.url)} // <-- Applied Helper
                className="doc-media doc-iframe"
                title="Provider Document"
              />
            ) : (
              <img
                src={getFullUrl(viewingDocument.url)} // <-- Applied Helper
                alt="Document Full View"
                className="doc-media doc-img"
              />
            )}
          </div>
        </div>
      )}

      {/* Custom Global Alert/Confirm Modal */}
      {modalConfig && (
        <div
          className="modal-overlay alert-overlay"
          onClick={() => modalConfig.type === "alert" && setModalConfig(null)}
        >
          <div
            className="alert-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="alert-modal-body">
              <h3 className="alert-title">{modalConfig.title}</h3>
              <p className="alert-message">{modalConfig.message}</p>
            </div>

            <div className="alert-modal-footer">
              {modalConfig.type === "confirm" && (
                <button
                  onClick={() => setModalConfig(null)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => {
                  if (modalConfig.onConfirm) modalConfig.onConfirm();
                  setModalConfig(null);
                }}
                className="btn-confirm"
              >
                {modalConfig.type === "confirm" ? "Confirm" : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
