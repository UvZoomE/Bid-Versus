import React from "react";
import {
  ChevronLeft,
  CheckCircle,
  FileText,
  MapPin,
  Shield,
} from "lucide-react";
import "../css/NewQuoteForm.css";

export default function NewQuoteForm({
  currentUser,
  newQuoteForm,
  setNewQuoteForm,
  handleCreateQuote,
  uploadedFile,
  setUploadedFile,
  handleQuoteZipChange,
  setCurrentScreen,
}) {
  return (
    <div className="card quote-form-container">
      {/* Header */}
      <div className="quote-form-header">
        <button
          onClick={() => setCurrentScreen("dashboard")}
          className="btn-back"
          type="button"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="quote-form-title">Upload an Estimate</h2>
      </div>

      {/* Main Form */}
      <form onSubmit={handleCreateQuote} className="quote-form-body">
        {/* Dropzone */}
        <div className="file-dropzone group">
          <input
            type="file"
            required
            accept=".pdf,.doc,.docx,image/*"
            onChange={(e) => setUploadedFile(e.target.files[0])}
            className="dropzone-input"
            title="Upload your quote document"
          />
          <div className="dropzone-content">
            {uploadedFile ? (
              <>
                <CheckCircle
                  className="w-10 h-10 dropzone-icon"
                  style={{ color: "var(--brand-green-hover)" }}
                />
                <p className="dropzone-success-text">
                  File attached: {uploadedFile.name}
                </p>
                <p className="dropzone-text-sub">
                  Click or drag a different file to replace
                </p>
              </>
            ) : (
              <>
                <FileText className="w-10 h-10 dropzone-icon" />
                <p className="dropzone-text-main">
                  Tap to upload a photo, PDF, or Word Doc{" "}
                  <span className="required-asterisk">*</span>
                </p>
                <p className="dropzone-text-sub">
                  Please make sure to cross out personal info before uploading.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Category & Amount Grid */}
        <div className="form-grid-2">
          <div className="form-group">
            <label>Category</label>
            <select
              value={newQuoteForm.category}
              onChange={(e) =>
                setNewQuoteForm({ ...newQuoteForm, category: e.target.value })
              }
              className="form-input"
            >
              <option value="Auto">Auto Repair</option>
              <option value="Home">Home Services / Handyman</option>
              <option value="Other">Other...</option>
            </select>
            {newQuoteForm.category === "Other" && (
              <div style={{ marginTop: "0.5rem" }}>
                <input
                  type="text"
                  maxLength="15"
                  required
                  value={newQuoteForm.customCategory}
                  onChange={(e) =>
                    setNewQuoteForm({
                      ...newQuoteForm,
                      customCategory: e.target.value,
                    })
                  }
                  placeholder="e.g. Phone Repair"
                  className="form-input"
                  style={{ fontSize: "0.875rem" }}
                />
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Original Quote Amount ($)</label>
            <input
              type="number"
              required
              value={newQuoteForm.originalQuote}
              onChange={(e) =>
                setNewQuoteForm({
                  ...newQuoteForm,
                  originalQuote: e.target.value,
                })
              }
              placeholder="e.g. 1200"
              className="form-input"
            />
          </div>
        </div>

        {/* Location Grid */}
        <div className="form-grid-3">
          <div className="form-group">
            <label>
              Zip Code <span className="required-asterisk">*</span>
            </label>
            <input
              type="text"
              required
              value={newQuoteForm.zipCode}
              onChange={handleQuoteZipChange}
              placeholder="e.g. 90210"
              className="form-input"
            />
          </div>
          <div
            className="form-group"
            style={{
              gridColumn: "span 1" /* handled by grid-template automatically */,
            }}
          >
            <label>City, State</label>
            <div
              className={`city-state-display ${!newQuoteForm.cityState ? "empty" : ""}`}
            >
              {newQuoteForm.cityState ? (
                <>
                  <MapPin className="w-4 h-4" />
                  <span style={{ fontWeight: 500 }}>
                    {newQuoteForm.cityState}
                  </span>
                </>
              ) : (
                <span>Enter Zip Code...</span>
              )}
            </div>
          </div>
        </div>

        {/* Title & Notes */}
        <div className="form-group">
          <label>Short Title</label>
          <input
            type="text"
            required
            value={newQuoteForm.title}
            onChange={(e) =>
              setNewQuoteForm({ ...newQuoteForm, title: e.target.value })
            }
            placeholder="e.g. Front Brake Replacement"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Notes / Details (Optional)</label>
          <textarea
            rows="3"
            value={newQuoteForm.description}
            onChange={(e) =>
              setNewQuoteForm({ ...newQuoteForm, description: e.target.value })
            }
            placeholder="Add any context... e.g. 'Car is a 2015 Toyota Camry, need it done by Friday'"
            className="form-input"
            style={{ resize: "vertical" }}
          />
        </div>

        {/* Guest Contact Info Lockbox (Only visible if not logged in) */}
        {!currentUser && (
          <div className="guest-info-box">
            <div className="guest-info-header">
              <Shield className="w-5 h-5" />
              Contact Information (Private)
            </div>
            <p className="guest-info-desc">
              Required for guests. This is securely hidden and ONLY revealed to
              the provider whose offer you accept.
            </p>

            <div className="form-grid-2">
              <div className="form-group">
                <label>
                  Full Name <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newQuoteForm.guestName}
                  onChange={(e) =>
                    setNewQuoteForm({
                      ...newQuoteForm,
                      guestName: e.target.value,
                    })
                  }
                  className="form-input"
                  placeholder="Jane Doe"
                />
              </div>
              <div className="form-group">
                <label>
                  Phone Number <span className="required-asterisk">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={newQuoteForm.guestPhone}
                  onChange={(e) =>
                    setNewQuoteForm({
                      ...newQuoteForm,
                      guestPhone: e.target.value,
                    })
                  }
                  className="form-input"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label>
                  Email Address <span className="required-asterisk">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newQuoteForm.guestEmail}
                  onChange={(e) =>
                    setNewQuoteForm({
                      ...newQuoteForm,
                      guestEmail: e.target.value,
                    })
                  }
                  className="form-input"
                  placeholder="jane@example.com"
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                    marginTop: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <input
                    type="checkbox"
                    id="guest-agree-quote"
                    required
                    checked={newQuoteForm.guestAgreed}
                    onChange={(e) =>
                      setNewQuoteForm({
                        ...newQuoteForm,
                        guestAgreed: e.target.checked,
                      })
                    }
                    style={{ marginTop: "0.2rem", cursor: "pointer" }}
                  />
                  <label
                    htmlFor="guest-agree-quote"
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-light)",
                      lineHeight: "1.4",
                      cursor: "pointer",
                    }}
                  >
                    I agree that my Name, Phone Number, and Email will be used
                    to securely create a free account so I can track this
                    request and receive lower bids.
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <button type="submit" className="btn-primary btn-submit-quote">
          Submit for Bids
        </button>
      </form>
    </div>
  );
}
