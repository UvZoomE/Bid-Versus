import React from "react";
import "../css/Modals.css";

export default function Modals({
  viewingDocument,
  setViewingDocument,
  modalConfig,
  setModalConfig,
}) {
  // HELPER: Formats the URL to strictly enforce HTTPS or fallback to placeholder
  const getFullUrl = (url) => {
    if (!url) {
      return "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800";
    }

    // If it's a secure Cloudinary image or any other valid secure link, use it
    if (url.startsWith("https")) {
      return url;
    }

    // If it's a legacy local path or HTTP, force the fallback placeholder
    return "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800";
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
                src={getFullUrl(viewingDocument.url)} // <-- Applied strict fallback helper
                className="doc-media doc-iframe"
                title="Provider Document"
              />
            ) : (
              <img
                src={getFullUrl(viewingDocument.url)} // <-- Applied strict fallback helper
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
