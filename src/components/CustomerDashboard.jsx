import React from "react";
import {
  Globe,
  Upload,
  Wrench,
  Home,
  Briefcase,
  MapPin,
  MessageSquare,
} from "lucide-react";
import "../css/CustomerDashboard.css";

export default function CustomerDashboard({
  jobs,
  getLowestBid,
  setSelectedJob,
  setCurrentScreen,
  resetBidForms,
}) {
  // Helper function to force Cloudinary to render PDFs as images
  const getThumbnailUrl = (url) => {
    if (!url) return null;
    // If it's a PDF, replace the extension with .jpg
    if (url.endsWith(".pdf")) {
      return url.replace(".pdf", ".jpg");
    }
    return url;
  };
  return (
    <div className="customer-dashboard">
      {/* Dashboard Header */}
      <div className="card dashboard-header">
        <div>
          <h1 className="header-title">
            <Globe className="w-6 h-6" />
            Global Community Feed
          </h1>
          <p className="header-desc">
            Submit your repair quote here at no cost and receive a lower price!
          </p>
        </div>
        <button
          onClick={() => {
            setCurrentScreen("new_quote");
            resetBidForms();
          }}
          className="btn-success upload-btn"
        >
          <Upload className="w-5 h-5" /> Upload Quote
        </button>
      </div>

      {/* Scrolling Feed Container */}
      <div className="feed-container">
        {jobs.map((job) => {
          console.log("Job Data:", job);
          const lowest = getLowestBid(job.bids);

          // Updated to handle MongoDB's _id structure
          const acceptedBid =
            job.status === "Accepted"
              ? job.bids.find((b) => (b._id || b.id) === job.acceptedBidId)
              : null;

          const isSavings =
            acceptedBid && acceptedBid.amount < job.originalQuote;

          const savingsPercent = isSavings
            ? Math.round(
                ((job.originalQuote - acceptedBid.amount) / job.originalQuote) *
                  100,
              )
            : 0;

          // Safely format the date depending on whether it's local state or from MongoDB
          const displayDate =
            job.date ||
            (job.createdAt
              ? new Date(job.createdAt).toLocaleDateString()
              : "Just now");

          return (
            <div
              key={job._id || job.id} // Updated key for MongoDB
              onClick={() => {
                setSelectedJob(job);
                setCurrentScreen("job_details");
                resetBidForms();
              }}
              className="card job-card"
            >
              {/* Card Top: Tags & Badges */}
              <div className="job-card-top">
                <div className="job-tags">
                  {job.category === "Auto" && (
                    <Wrench className="w-5 h-5" style={{ color: "#60a5fa" }} />
                  )}
                  {job.category === "Home" && (
                    <Home className="w-5 h-5" style={{ color: "#fb923c" }} />
                  )}
                  {job.category !== "Auto" && job.category !== "Home" && (
                    <Briefcase
                      className="w-5 h-5"
                      style={{ color: "#c084fc" }}
                    />
                  )}

                  <span className="job-category">
                    {job.category === "Home" || job.category === "Auto"
                      ? `${job.category} Repair`
                      : job.category}
                  </span>

                  {job.location && (
                    <span className="job-location">
                      <MapPin className="w-3 h-3" /> {job.location}
                    </span>
                  )}
                </div>

                <div className="job-stats">
                  <span className="stat-badge stat-comments">
                    <MessageSquare className="w-3 h-3" />{" "}
                    {job.jobComments?.length || 0}
                  </span>
                  <span className="stat-badge stat-offers">
                    {job.bids?.length || 0} Offers
                  </span>
                </div>
              </div>

              {/* Card Middle: Text Content */}
              <div className="text-content-container">
                <h3 className="job-title">{job.title}</h3>
                {job.documentUrl && job.documentUrl.startsWith("https") ? (
                  <div className="job-image-container">
                    <img
                      src={getThumbnailUrl(job.documentUrl)}
                      alt="Quote attachment"
                      className="job-image"
                    />
                  </div>
                ) : (
                  <div className="job-image-container">
                    <img
                      src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800"
                      alt="Quote attachment"
                      className="job-image"
                    />
                  </div>
                )}
                <p className="job-meta">
                  Posted by <strong>{job.author}</strong> • {displayDate}
                </p>
                <p className="job-desc">{job.description}</p>
              </div>

              {/* Card Bottom: Pricing */}
              <div className="job-footer">
                <div className="quote-block">
                  <p className="price-label">Original Quote</p>
                  {isSavings ? (
                    <div>
                      <p className="original-price strikethrough">
                        ${job.originalQuote}
                      </p>
                      <p className="savings-text">
                        Saved {savingsPercent}% ($
                        {(job.originalQuote - acceptedBid.amount).toFixed(0)})
                      </p>
                    </div>
                  ) : (
                    <p className="original-price">${job.originalQuote}</p>
                  )}
                </div>

                <div className="offer-block" style={{ textAlign: "right" }}>
                  <p className="price-label best-offer-label">Best Offer</p>
                  {lowest ? (
                    <p className="best-offer-price">${lowest}</p>
                  ) : (
                    <p className="awaiting-offers">Awaiting offers...</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
