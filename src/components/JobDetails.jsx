import React from "react";
import {
  ChevronLeft,
  MapPin,
  FileText,
  MessageSquare,
  Send,
  User,
  CheckCircle,
  Shield,
  DollarSign,
  Upload,
  Loader2,
  Star,
  MessageCircle,
} from "lucide-react";
import "../css/JobDetails.css";

export default function JobDetails({
  selectedJob,
  currentUser,
  viewMode,
  setCurrentScreen,
  resetBidForms,
  setViewingDocument,
  jobCommentInput,
  setJobCommentInput,
  handleAddJobComment,
  existingBidForCurrentJob,
  editingBidId,
  setEditingBidId,
  newBidForm,
  setNewBidForm,
  handleRescindOffer,
  handleSubmitBid,
  newBidFile,
  setNewBidFile,
  setSignatureWarning,
  setSignatureVerified,
  signatureWarning,
  isAnalyzingSignature,
  handleBidZipChange,
  handleUnacceptOffer,
  handleAcceptOffer,
  showCounter,
  setShowCounter,
  counterAmounts,
  setCounterAmounts,
  handleCounterOfferSubmit,
  expandedComments,
  toggleComments,
  commentInputs,
  setCommentInputs,
  handleAddComment,
  fetchJobs,
}) {
  // Helper to safely format dates
  const displayDate =
    selectedJob.date ||
    (selectedJob.createdAt
      ? new Date(selectedJob.createdAt).toLocaleDateString()
      : "Just now");
  const jobId = selectedJob._id || selectedJob.id;

  // === CHECK IF I WON ===
  const isWinningBidder =
    selectedJob.status === "Accepted" &&
    existingBidForCurrentJob &&
    selectedJob.acceptedBidId ===
      (existingBidForCurrentJob._id || existingBidForCurrentJob.id);

  // === CHECK IF I OWN THIS JOB ===
  const isJobOwner =
    currentUser &&
    ((selectedJob.contactInfo?.email &&
      currentUser.email === selectedJob.contactInfo.email) ||
      currentUser.name === selectedJob.author);

  // === HANDLER: CUSTOMER SENDS COUNTER ===
  const onSendCustomerCounter = async (bidId) => {
    const amount = counterAmounts[bidId];
    if (!amount) return;

    try {
      const token = localStorage.getItem("bidVersusToken");
      await fetch(
        `https://bid-versus-backend.onrender.com/api/bids/${bidId}/counter`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount }),
        },
      );
      setShowCounter((prev) => ({ ...prev, [bidId]: false }));
      if (fetchJobs) await fetchJobs();
    } catch (error) {
      console.error(error);
    }
  };

  // === HANDLER: PROVIDER RESPONDS TO COUNTER ===
  const onProviderResponse = async (bidId, action, newAmount = null) => {
    try {
      // 1. Optimistic UI Update (Hide the blue box immediately)
      if (existingBidForCurrentJob && existingBidForCurrentJob._id === bidId) {
        const updatedBid = { ...existingBidForCurrentJob, customerOffer: null };
      }

      const token = localStorage.getItem("bidVersusToken");
      const response = await fetch(
        `https://bid-versus-backend.onrender.com/api/bids/${bidId}/respond-counter`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action, newAmount }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Provider Response Error:", data.message);
        alert(`Error: ${data.message}`);
      }

      if (fetchJobs) await fetchJobs();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="job-details-container">
      <div className="job-details-grid">
        {/* =========================================
            LEFT COLUMN: JOB INFO
            ========================================= */}
        <div className="column-left">
          <button
            onClick={() => {
              setCurrentScreen("dashboard");
              resetBidForms();
            }}
            className="back-btn"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Feed
          </button>

          <div className="card">
            <div className="jd-header">
              <div className="jd-meta-row">
                <div className="jd-tags">
                  <span className="tag-category">
                    {selectedJob.category} Service
                  </span>
                  {selectedJob.location && (
                    <span className="tag-location">
                      <MapPin className="w-3 h-3" /> {selectedJob.location}
                    </span>
                  )}
                </div>
                <span className="jd-author-info">
                  Posted by <strong>{selectedJob.author}</strong> •{" "}
                  {displayDate}
                </span>
              </div>
              <h1 className="jd-title">{selectedJob.title}</h1>
              <p className="jd-desc">{selectedJob.description}</p>
            </div>

            {/* Document Viewer */}
            <div
              className="doc-viewer-container"
              onClick={() =>
                setViewingDocument({
                  url:
                    selectedJob.documentUrl &&
                    selectedJob.documentUrl.startsWith("https")
                      ? selectedJob.documentUrl
                      : "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800",
                  type: selectedJob.documentType || "image/jpeg",
                })
              }
            >
              <div className="doc-hover-overlay">
                <div className="doc-hover-btn">
                  <FileText className="w-4 h-4" /> View Full Document
                </div>
              </div>

              <div className="doc-preview-box">
                {selectedJob.documentType === "application/pdf" ? (
                  <div className="pdf-placeholder">
                    <FileText className="w-16 h-16" />
                    <span>PDF Document Attached</span>
                  </div>
                ) : (
                  <img
                    src={(() => {
                      if (
                        !selectedJob.documentUrl ||
                        !selectedJob.documentUrl.startsWith("https")
                      )
                        return "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800";
                      return selectedJob.documentUrl;
                    })()}
                    alt="Original Quote Preview"
                    className="img-preview"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800";
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Job Comments */}
          <div className="section-box">
            <h3 className="section-title">
              <MessageSquare className="w-5 h-5" /> Comments
            </h3>

            <div className="comments-list">
              {!selectedJob.jobComments ||
              selectedJob.jobComments.length === 0 ? (
                <p className="comment-text" style={{ fontStyle: "italic" }}>
                  No community feedback on this request yet.
                </p>
              ) : (
                selectedJob.jobComments.map((comment) => (
                  <div key={comment._id || comment.id} className="comment-item">
                    <div className="comment-header">
                      <span className="comment-author">{comment.author}</span>
                      <span className="comment-date">
                        {comment.date
                          ? new Date(comment.date).toLocaleDateString()
                          : "Just now"}
                      </span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                ))
              )}
            </div>

            <div className="comment-input-row">
              <input
                type="text"
                value={jobCommentInput}
                onChange={(e) => setJobCommentInput(e.target.value)}
                placeholder="Ask for details, warn about scams, or give advice..."
                className="form-input"
                onKeyPress={(e) =>
                  e.key === "Enter" && handleAddJobComment(jobId)
                }
              />
              <button
                onClick={() => handleAddJobComment(jobId)}
                className="btn-post"
              >
                Post <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Provider View: Lockbox */}
          {viewMode === "provider" && (
            <div className="section-box">
              <h3 className="section-title">
                <User className="w-5 h-5" /> Customer Contact Info
              </h3>

              {selectedJob.status === "Accepted" ? (
                isWinningBidder ? (
                  <div className="lockbox-accepted">
                    <div className="lockbox-accepted-title">
                      <CheckCircle className="w-5 h-5" /> Offer Accepted - Info
                      Unlocked
                    </div>
                    <div className="lockbox-details">
                      <p>
                        <span>Name:</span>{" "}
                        {selectedJob.contactInfo?.name || selectedJob.author}
                      </p>
                      <p>
                        <span>Phone:</span>{" "}
                        {selectedJob.contactInfo?.phone || "(555) 123-4567"}
                      </p>
                      <p>
                        <span>Email:</span>{" "}
                        {selectedJob.contactInfo?.email ||
                          "customer@example.com"}
                      </p>
                    </div>
                    <button
                      className="btn-success"
                      style={{ width: "100%", marginTop: "1rem" }}
                      onClick={() =>
                        (window.location.href = `mailto:${selectedJob.contactInfo?.email}`)
                      }
                    >
                      Contact Customer
                    </button>
                  </div>
                ) : (
                  <div
                    className="lockbox-hidden"
                    style={{
                      borderColor: "#f59e0b",
                      backgroundColor: "rgba(245, 158, 11, 0.1)",
                    }}
                  >
                    <Shield className="w-8 h-8" style={{ color: "#f59e0b" }} />
                    <p className="status" style={{ color: "#f59e0b" }}>
                      Offer Accepted
                    </p>
                    <p className="desc">
                      The customer has accepted another offer, but you can still
                      submit a bid in case the deal falls through!
                    </p>
                  </div>
                )
              ) : (
                <div className="lockbox-hidden">
                  <Shield className="w-8 h-8" />
                  <p className="status">Hidden for Privacy</p>
                  <p className="desc">
                    The customer's contact information is secure. It will
                    automatically unlock here if they accept your offer.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =========================================
            RIGHT COLUMN: BIDS & ACTIONS
            ========================================= */}
        <div className="column-right">
          <div className="quote-highlight-box">
            <p className="label">Original Quote</p>
            {(() => {
              const acceptedBid =
                selectedJob.status === "Accepted"
                  ? selectedJob.bids.find(
                      (b) => (b._id || b.id) === selectedJob.acceptedBidId,
                    )
                  : null;
              const isSavings =
                acceptedBid && acceptedBid.amount < selectedJob.originalQuote;
              const savingsPercent = isSavings
                ? Math.round(
                    ((selectedJob.originalQuote - acceptedBid.amount) /
                      selectedJob.originalQuote) *
                      100,
                  )
                : 0;

              if (isSavings) {
                return (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <p className="amount strikethrough">
                      ${selectedJob.originalQuote}
                    </p>
                    <div className="savings-badge">
                      Saved {savingsPercent}% ($
                      {(selectedJob.originalQuote - acceptedBid.amount).toFixed(
                        2,
                      )}
                      )
                    </div>
                  </div>
                );
              }
              return <p className="amount">${selectedJob.originalQuote}</p>;
            })()}
          </div>

          {/* ===================================
              CUSTOMER VIEW LOGIC
              =================================== */}
          {viewMode === "customer" ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  color: "white",
                  marginTop: "1rem",
                  marginBottom: "0.5rem",
                }}
              >
                Offers Received ({selectedJob.bids.length})
              </h3>

              {selectedJob.bids.length === 0 ? (
                <div
                  style={{
                    backgroundColor: "rgba(30,58,138,0.3)",
                    border: "1px solid rgba(30,58,138,0.8)",
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    textAlign: "center",
                    color: "#60a5fa",
                    fontSize: "0.875rem",
                  }}
                >
                  We're notifying local pros. Check back soon for offers!
                </div>
              ) : (
                selectedJob.bids.map((bid) => {
                  const bId = bid._id || bid.id;
                  return (
                    <div key={bId} className="bid-card">
                      <div className="bid-status-bar"></div>

                      <div className="bid-header">
                        <div>
                          <p className="bid-provider">{bid.providerName}</p>
                          <div className="bid-meta">
                            {bid.location && (
                              <>
                                <MapPin className="w-3 h-3" /> {bid.location}
                              </>
                            )}
                            {bid.rating && (
                              <>
                                {bid.location && <span className="dot">•</span>}
                                <span className="bid-rating">
                                  <Star className="w-3 h-3" /> {bid.rating}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p className="bid-amount">${bid.amount}</p>
                          {bid.customerOffer && (
                            <span
                              className="badge-pending"
                              style={{
                                display: "block",
                                fontSize: "0.7rem",
                                color: "#f59e0b",
                                fontWeight: "bold",
                                marginTop: "0.2rem",
                              }}
                            >
                              Pending Counter: ${bid.customerOffer}
                            </span>
                          )}
                        </div>
                      </div>

                      {bid.providerContact && (
                        <div className="bid-contact-box">
                          <div className="split">
                            <span>
                              <strong>Phone:</strong>{" "}
                              {bid.providerContact.phone}
                            </span>
                            <span>
                              <strong>Email:</strong>{" "}
                              {bid.providerContact.email}
                            </span>
                          </div>
                          <p>
                            <strong>Location:</strong>{" "}
                            {bid.providerContact.location}
                          </p>
                        </div>
                      )}

                      <p className="bid-notes">{bid.notes}</p>

                      {bid.signedDocumentAttached && (
                        <button
                          onClick={() =>
                            setViewingDocument({
                              url:
                                bid.documentUrl &&
                                bid.documentUrl.startsWith("https")
                                  ? bid.documentUrl
                                  : "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800",
                              type: bid.documentType || "image/jpeg",
                            })
                          }
                          className={`doc-btn ${bid.verifiedByTopDogg ? "doc-btn-verified" : "doc-btn-unverified"}`}
                        >
                          <span>
                            {bid.verifiedByTopDogg ? (
                              <>
                                <Shield className="w-4 h-4" /> Signature
                                verified
                              </>
                            ) : (
                              <>
                                <FileText className="w-4 h-4" /> Unverified
                                Document
                              </>
                            )}
                          </span>
                          <span style={{ textDecoration: "underline" }}>
                            View
                          </span>
                        </button>
                      )}

                      {/* PROVIDER'S COUNTER DISPLAY */}
                      {bid.counterAmount && (
                        <div className="counter-display">
                          <span>Provider Counter:</span>
                          <span className="amt">${bid.counterAmount}</span>
                        </div>
                      )}

                      <div className="bid-actions">
                        {isJobOwner && (
                          <>
                            <button
                              onClick={() =>
                                selectedJob.acceptedBidId === bId
                                  ? handleUnacceptOffer(jobId)
                                  : handleAcceptOffer(jobId, bId)
                              }
                              disabled={
                                selectedJob.status === "Accepted" &&
                                selectedJob.acceptedBidId !== bId
                              }
                              className={`btn-action ${selectedJob.acceptedBidId === bId ? "btn-accepted" : "btn-accept"}`}
                            >
                              {selectedJob.acceptedBidId === bId
                                ? "✓ Accepted (Undo)"
                                : "Accept Offer"}
                            </button>

                            {!bid.customerOffer && (
                              <button
                                onClick={() =>
                                  setShowCounter((prev) => ({
                                    ...prev,
                                    [bId]: !prev[bId],
                                  }))
                                }
                                className="btn-action btn-counter"
                              >
                                Counter-Offer
                              </button>
                            )}
                          </>
                        )}

                        <button
                          onClick={() => toggleComments(bId)}
                          className="btn-chat"
                          style={!isJobOwner ? { flex: 1 } : {}}
                        >
                          <MessageCircle className="w-4 h-4" />{" "}
                          {bid.comments?.length || 0}
                        </button>
                      </div>

                      {/* CUSTOMER COUNTER INPUT */}
                      {isJobOwner && showCounter[bId] && !bid.customerOffer && (
                        <div className="counter-input-row">
                          <span className="counter-label">Counter: $</span>
                          <input
                            type="number"
                            value={counterAmounts[bId] || ""}
                            onChange={(e) =>
                              setCounterAmounts((prev) => ({
                                ...prev,
                                [bId]: e.target.value,
                              }))
                            }
                            placeholder="Your price"
                            className="form-input"
                          />
                          <button
                            onClick={() => onSendCustomerCounter(bId)}
                            className="btn-counter-send"
                          >
                            Send
                          </button>
                        </div>
                      )}

                      {/* COMMENTS */}
                      {expandedComments[bId] && (
                        <div
                          style={{
                            marginTop: "1rem",
                            paddingTop: "1rem",
                            borderTop: "1px solid var(--border-color)",
                          }}
                        >
                          <h4
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              color: "var(--text-muted)",
                              textTransform: "uppercase",
                              marginBottom: "0.75rem",
                            }}
                          >
                            Community Discussion
                          </h4>
                          <div
                            className="comments-list"
                            style={{ maxHeight: "12rem", overflowY: "auto" }}
                          >
                            {!bid.comments || bid.comments.length === 0 ? (
                              <p
                                className="comment-text"
                                style={{ fontStyle: "italic" }}
                              >
                                No comments yet. Be the first to weigh in!
                              </p>
                            ) : (
                              bid.comments.map((comment) => (
                                <div
                                  key={comment._id || comment.id}
                                  className="comment-item"
                                >
                                  <div className="comment-header">
                                    <span className="comment-author">
                                      {comment.author}
                                    </span>
                                    <span className="comment-date">
                                      {comment.date
                                        ? new Date(
                                            comment.date,
                                          ).toLocaleDateString()
                                        : "Just now"}
                                    </span>
                                  </div>
                                  <p className="comment-text">{comment.text}</p>
                                </div>
                              ))
                            )}
                          </div>
                          <div className="comment-input-row">
                            <input
                              type="text"
                              value={commentInputs[bId] || ""}
                              onChange={(e) =>
                                setCommentInputs((prev) => ({
                                  ...prev,
                                  [bId]: e.target.value,
                                }))
                              }
                              placeholder="Ask about this provider or offer..."
                              className="form-input"
                              onKeyPress={(e) =>
                                e.key === "Enter" &&
                                handleAddComment(jobId, bId)
                              }
                            />
                            <button
                              onClick={() => handleAddComment(jobId, bId)}
                              className="btn-primary"
                              style={{ padding: "0.5rem" }}
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : /* ===================================
                PROVIDER VIEW LOGIC (Else Block)
                =================================== */
          isJobOwner ? (
            /* SCENARIO 1: I AM THE AUTHOR (BLOCK BIDDING) */
            <div
              className="section-box"
              style={{ textAlign: "center", padding: "2rem" }}
            >
              <User
                className="w-12 h-12"
                style={{
                  margin: "0 auto 1rem auto",
                  color: "var(--text-muted)",
                }}
              />
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                  color: "white",
                }}
              >
                You posted this request
              </h3>
              <p style={{ color: "var(--text-muted)" }}>
                You cannot submit a bid on your own job. Switch to "Customer
                View" to manage offers.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
                style={{ marginTop: "1rem" }}
              >
                Refresh View
              </button>
            </div>
          ) : existingBidForCurrentJob &&
            editingBidId !==
              (existingBidForCurrentJob._id || existingBidForCurrentJob.id) ? (
            /* SCENARIO 2: EXISTING BID (Show Card + Counter Box) */
            (() => {
              // FORCE FRESH DATA for instant updates
              const freshBid =
                selectedJob.bids.find(
                  (b) =>
                    (b._id || b.id) ===
                    (existingBidForCurrentJob._id ||
                      existingBidForCurrentJob.id),
                ) || existingBidForCurrentJob;

              return (
                <div
                  className="card provider-bid-card"
                  style={{
                    padding: "1.25rem",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div className="bid-status-bar"></div>
                  <h3 className="status-title">
                    <CheckCircle className="w-5 h-5" /> You placed an offer
                  </h3>
                  <p className="big-price">${freshBid.amount}</p>

                  {freshBid.customerOffer ? (
                    <div
                      className="counter-response-box"
                      style={{
                        backgroundColor: "#eff6ff",
                        padding: "1rem",
                        borderRadius: "0.5rem",
                        marginBottom: "1rem",
                        border: "1px solid #bfdbfe",
                      }}
                    >
                      <p
                        style={{
                          fontWeight: "bold",
                          color: "#1e40af",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Customer Counter: ${freshBid.customerOffer}
                      </p>
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "#60a5fa",
                          marginBottom: "0.75rem",
                        }}
                      >
                        The customer wants to pay this amount. Accept it to win
                        the job immediately, or decline to stick to your price.
                      </p>
                      <div className="action-buttons-row">
                        <button
                          onClick={() =>
                            onProviderResponse(
                              freshBid._id || freshBid.id,
                              "accept",
                            )
                          }
                          className="btn-success"
                          style={{ flex: 1 }}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            onProviderResponse(
                              freshBid._id || freshBid.id,
                              "decline",
                            )
                          }
                          className="btn-action"
                          style={{
                            flex: 1,
                            backgroundColor: "white",
                            color: "#333",
                            border: "1px solid #ddd",
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="bid-notes" style={{ marginBottom: "1rem" }}>
                      {freshBid.notes}
                    </p>
                  )}

                  <div className="action-buttons-row">
                    <button
                      onClick={() => {
                        setEditingBidId(freshBid._id || freshBid.id);
                        setNewBidForm({
                          amount: freshBid.amount.toString(),
                          notes: freshBid.notes,
                          zipCode: freshBid.zipCode || "",
                          cityState: freshBid.location || "",
                          guestBusinessName: freshBid.providerName,
                          guestPhone: freshBid.providerContact?.phone || "",
                          guestEmail: freshBid.providerContact?.email || "",
                          guestLocation:
                            freshBid.providerContact?.location || "",
                        });
                      }}
                      className="btn-action btn-edit"
                    >
                      Edit Bid
                    </button>
                    <button
                      onClick={() =>
                        handleRescindOffer(jobId, freshBid._id || freshBid.id)
                      }
                      className="btn-action btn-rescind"
                    >
                      Rescind Offer
                    </button>
                  </div>
                </div>
              );
            })()
          ) : (
            /* SCENARIO 3: NO BID YET (Show Submit Form) */
            <div className="section-box">
              <h3
                style={{
                  fontWeight: "bold",
                  fontSize: "1.125rem",
                  color: "white",
                  marginBottom: "1rem",
                }}
              >
                {editingBidId
                  ? "Edit Your Counter-Offer"
                  : "Submit Counter-Offer"}
              </h3>

              <form
                onSubmit={handleSubmitBid}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {/* === START GUEST PROVIDER FIELDS === */}
                {!currentUser && !editingBidId && (
                  <div
                    className="guest-info-box"
                    style={{ marginBottom: "1.5rem" }}
                  >
                    <div className="guest-info-header">
                      <User className="w-5 h-5" />
                      Provider Information
                    </div>
                    <p className="guest-info-desc">
                      Enter your business details to submit this bid. We will
                      automatically create an account for you.
                    </p>

                    <div style={{ display: "grid", gap: "1rem" }}>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            color: "var(--text-light)",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Business Name{" "}
                          <span style={{ color: "#f87171" }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newBidForm.guestBusinessName}
                          onChange={(e) =>
                            setNewBidForm({
                              ...newBidForm,
                              guestBusinessName: e.target.value,
                            })
                          }
                          placeholder="e.g. Mike's Auto Shop"
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            color: "var(--text-light)",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Email <span style={{ color: "#f87171" }}>*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={newBidForm.guestEmail}
                          onChange={(e) =>
                            setNewBidForm({
                              ...newBidForm,
                              guestEmail: e.target.value,
                            })
                          }
                          placeholder="mike@example.com"
                          className="form-input"
                        />
                        {/* === NEW: TERMS AGREEMENT CHECKBOX === */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.5rem",
                            marginTop: "0.5rem",
                          }}
                        >
                          <input
                            type="checkbox"
                            id="guest-agree-bid"
                            required
                            checked={newBidForm.guestAgreed}
                            onChange={(e) =>
                              setNewBidForm({
                                ...newBidForm,
                                guestAgreed: e.target.checked,
                              })
                            }
                            style={{ marginTop: "0.2rem", cursor: "pointer" }}
                          />
                          <label
                            htmlFor="guest-agree-bid"
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--text-light)",
                              lineHeight: "1.4",
                              cursor: "pointer",
                            }}
                          >
                            I agree that my Name, Phone Number, and Email will
                            be used to create a free account to help me manage
                            this bid and win jobs.
                          </label>
                        </div>
                      </div>

                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          fontStyle: "italic",
                          marginTop: "0.5rem",
                        }}
                      >
                        * Your business location will be automatically set to
                        the <strong>Zip Code</strong> you enter below.
                      </p>
                    </div>
                  </div>
                )}
                {/* === END GUEST PROVIDER FIELDS === */}

                {/* === EVERYONE SEES THIS (Including Logged-in Users) === */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "var(--text-light)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Contact Phone Number{" "}
                    <span style={{ color: "#f87171" }}>*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={newBidForm.guestPhone}
                    onChange={(e) =>
                      setNewBidForm({
                        ...newBidForm,
                        guestPhone: e.target.value,
                      })
                    }
                    placeholder="(555) 123-4567"
                    className="form-input"
                  />
                </div>

                <div className="zip-city-row">
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        color: "var(--text-light)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Zip Code <span style={{ color: "#f87171" }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newBidForm.zipCode}
                      onChange={handleBidZipChange}
                      placeholder="e.g. 90210"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        color: "var(--text-light)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      City, State
                    </label>
                    <div
                      className="form-input"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        height: "38px",
                        backgroundColor: "var(--bg-input)",
                      }}
                    >
                      {newBidForm.cityState ? (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                          }}
                        >
                          <MapPin
                            className="w-4 h-4"
                            style={{
                              color: "var(--brand-blue-hover)",
                              marginRight: "0.25rem",
                            }}
                          />{" "}
                          {newBidForm.cityState}
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          Enter Zip Code...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "var(--text-light)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Your Total Price ($)
                  </label>
                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        position: "absolute",
                        left: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                      }}
                    >
                      <DollarSign
                        className="w-5 h-5"
                        style={{ color: "var(--text-muted)" }}
                      />
                    </div>
                    <input
                      type="number"
                      required
                      value={newBidForm.amount}
                      onChange={(e) =>
                        setNewBidForm({
                          ...newBidForm,
                          amount: e.target.value,
                        })
                      }
                      className="form-input"
                      style={{ paddingLeft: "2.5rem" }}
                      placeholder="e.g. 600"
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "var(--text-light)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Pitch / Notes to Customer
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={newBidForm.notes}
                    onChange={(e) =>
                      setNewBidForm({ ...newBidForm, notes: e.target.value })
                    }
                    className="form-input"
                    style={{ resize: "vertical" }}
                    placeholder="Mention parts quality, warranties, or when you can schedule them."
                  ></textarea>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "var(--text-light)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Signed Confirmation{" "}
                    {!editingBidId && (
                      <span style={{ color: "#f87171" }}>*</span>
                    )}
                  </label>
                  <div className="bid-dropzone group">
                    <input
                      key={editingBidId || "new_bid"}
                      type="file"
                      required={!editingBidId}
                      accept=".pdf,.doc,.docx,image/*"
                      onChange={(e) => {
                        setNewBidFile(e.target.files[0]);
                        setSignatureWarning(false);
                        setSignatureVerified(false);
                      }}
                      className="bid-dropzone-input"
                    />
                    {newBidFile ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <CheckCircle
                          className="w-5 h-5"
                          style={{ color: "var(--brand-green-hover)" }}
                        />
                        <p
                          style={{
                            fontWeight: "500",
                            fontSize: "0.875rem",
                            color: "var(--brand-green-hover)",
                            maxWidth: "200px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {newBidFile.name}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Upload
                          className="w-6 h-6"
                          style={{
                            margin: "0 auto 0.5rem auto",
                            color: "var(--text-muted)",
                          }}
                        />
                        <p
                          style={{
                            fontWeight: "500",
                            fontSize: "0.875rem",
                            color: "var(--text-light)",
                          }}
                        >
                          {editingBidId
                            ? "Tap to upload a NEW signed PDF or Image"
                            : "Tap to upload signed PDF or Image"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {signatureWarning && (
                  <div className="warning-box">
                    <p className="title">Signature Not Detected</p>
                    <div className="action-buttons-row">
                      <button
                        type="button"
                        onClick={() => {
                          setSignatureWarning(false);
                          setNewBidFile(null);
                        }}
                        className="btn-warning-outline"
                      >
                        Upload Clearer File
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleSubmitBid(e, true)}
                        className="btn-warning-fill"
                      >
                        Submit Anyway (No Stamp)
                      </button>
                    </div>
                  </div>
                )}

                {!signatureWarning && (
                  <div className="action-buttons-row">
                    {editingBidId && (
                      <button
                        type="button"
                        onClick={() => resetBidForms()}
                        className="btn-post"
                        style={{ flex: "1", justifyContent: "center" }}
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isAnalyzingSignature}
                      className="btn-primary"
                      style={{ flex: editingBidId ? "2" : "1" }}
                    >
                      {isAnalyzingSignature ? (
                        <>
                          <Loader2
                            className="w-5 h-5 animate-spin"
                            style={{ marginRight: "0.5rem" }}
                          />{" "}
                          Verifying...
                        </>
                      ) : editingBidId ? (
                        "Update Bid"
                      ) : (
                        "Submit Bid"
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
