import React from "react";
import { MapPin, CheckCircle } from "lucide-react";
import "../css/ProviderDashboard.css";

export default function ProviderDashboard({
  jobs,
  myBidJobIds,
  currentUser,
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
    <div className="provider-dashboard">
      {/* Dashboard Header */}
      <div className="card provider-header">
        <h1>Global Job Leads</h1>
        <p>
          Review customer quotes and submit competitive counter-offers at no
          cost!
        </p>
      </div>

      {/* List of Jobs */}
      <div className="provider-job-list">
        {jobs.map((job) => {
          // Handle both MongoDB _id and local state id
          const jobId = job._id || job.id;

          // Check if the current user has already placed a bid on this job
          const userHasBid =
            myBidJobIds.includes(jobId) ||
            (currentUser &&
              job.bids?.some((b) => b.providerName === currentUser.name));

          // Safely format the date depending on whether it's local state or from MongoDB
          const displayDate =
            job.date ||
            (job.createdAt
              ? new Date(job.createdAt).toLocaleDateString()
              : "Just now");

          return (
            <div
              key={jobId}
              onClick={() => {
                setSelectedJob(job);
                setCurrentScreen("job_details");
                resetBidForms();
              }}
              className="card provider-job-card"
            >
              {/* Left Side (Top on Mobile): Job Info */}
              <div className="p-job-info">
                <div className="p-job-meta-row">
                  <span
                    className={`p-category-badge ${job.category === "Auto" ? "badge-auto" : job.category === "Home" ? "badge-home" : "badge-other"}`}
                  >
                    {job.category === "Home" || job.category === "Auto"
                      ? `${job.category} Repair`
                      : job.category}
                  </span>

                  {job.location && (
                    <span className="p-job-location">
                      <MapPin className="w-3 h-3" /> {job.location}
                    </span>
                  )}

                  <span className="p-job-date">Posted {displayDate}</span>

                  <div className="p-job-actions">
                    <div>
                      <p className="p-quote-label">Customer's Quote</p>
                      <p className="p-quote-amount">${job.originalQuote}</p>
                    </div>
                    <button
                      className={`btn-bid-action ${userHasBid ? "btn-bid-placed" : "btn-view-bid"}`}
                    >
                      {userHasBid ? (
                        <>
                          <CheckCircle className="w-4 h-4" /> Bid Placed
                        </>
                      ) : (
                        "View & Bid"
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-image-container">
                  <h3 className="p-job-title">{job.title}</h3>
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
                  <p className="p-job-desc">{job.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
