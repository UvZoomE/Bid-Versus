/* eslint-disable prefer-const */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import "./App.css";

// Import Child Components
import Navbar from "./components/NavBar.jsx";
import AuthScreen from "./components/AuthScreen.jsx";
import ProviderDashboard from "./components/ProviderDashboard.jsx";
import CustomerDashboard from "./components/CustomerDashboard.jsx";
import NewQuoteForm from "./components/NewQuoteForm.jsx";
import JobDetails from "./components/JobDetails.jsx";
import Modals from "./components/Modals.jsx";
import VerifyEmail from "./components/VerifyEmail.jsx";

export default function App() {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState("customer");
  const [selectedJob, setSelectedJob] = useState(null);

  // ==========================================
  // GLOBAL DATA SYNC (The Single Source of Truth)
  // ==========================================
  const [jobs, setJobs] = useState([]);

  const fetchJobs = async () => {
    try {
      const response = await fetch("https://bid-versus-backend.onrender.com/api/jobs");
      const data = await response.json();

      // 1. Update the background board
      setJobs(data);

      // 2. Safely update the screen WITHOUT teleporting
      setSelectedJob((prevSelectedJob) => {
        // If you aren't looking at a job, do nothing
        if (!prevSelectedJob) return null;

        // Find the fresh data for the exact job you are looking at
        const freshJobData = data.find(
          (job) =>
            (job._id || job.id) === (prevSelectedJob._id || prevSelectedJob.id),
        );

        // Debug Log to prove it is staying on the right job
        if (freshJobData) {
          console.log(
            `[POLL] Successfully refreshed data for: ${freshJobData.title}`,
          );
        } else {
          console.log(
            `[POLL] Job not found in new data, keeping current view.`,
          );
        }

        // Stay on this job, just update its data
        return freshJobData || prevSelectedJob;
      });
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  // Fetch alerts for the logged-in user
  const fetchNotifications = async () => {
    const token = localStorage.getItem("bidVersusToken");
    if (!token) return; // Don't fetch if not logged in

    try {
      const response = await fetch("https://bid-versus-backend.onrender.com/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(
          data.map((n) => ({
            id: n._id,
            jobId: n.job,
            message: n.message,
            read: n.read,
            date: new Date(n.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          })),
        );
      }
    } catch (error) {
      console.error("Notif fetch error", error);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // ==========================================
  // APPLICATION STATES
  // ==========================================
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "" });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [unverifiedEmails, setUnverifiedEmails] = useState([]);

  const [newQuoteForm, setNewQuoteForm] = useState({
    title: "",
    category: "Auto",
    customCategory: "",
    description: "",
    originalQuote: "",
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    zipCode: "",
    cityState: "",
    guestAgreed: false,
  });
  const [newBidForm, setNewBidForm] = useState({
    amount: "",
    notes: "",
    guestBusinessName: "",
    guestPhone: "",
    guestEmail: "",
    guestLocation: "",
    zipCode: "",
    cityState: "",
    guestAgreed: false,
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [newBidFile, setNewBidFile] = useState(null);

  const [isAnalyzingSignature, setIsAnalyzingSignature] = useState(false);
  const [signatureWarning, setSignatureWarning] = useState(false);
  const [signatureVerified, setSignatureVerified] = useState(false);

  const [myBidJobIds, setMyBidJobIds] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [editingBidId, setEditingBidId] = useState(null);

  const [guestNamesByJob, setGuestNamesByJob] = useState({});
  const [viewingDocument, setViewingDocument] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [jobCommentInput, setJobCommentInput] = useState("");
  const [showCounter, setShowCounter] = useState({});
  const [counterAmounts, setCounterAmounts] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [modalConfig, setModalConfig] = useState(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  useEffect(() => {
    if (currentUser && currentUser.phone) {
      setNewBidForm((prev) => ({ ...prev, guestPhone: currentUser.phone }));
      setNewQuoteForm((prev) => ({ ...prev, guestPhone: currentUser.phone }));
    }
  }, [currentUser]);

  // NEW: Bulletproof Polling Timer (Replaces setInterval completely)
  useEffect(() => {
    let isMounted = true;
    let timerId;

    const runPolling = async () => {
      // Stop running if the user logged out or closed the app
      if (!isMounted || !currentUser) return;

      try {
        await fetchNotifications();
        await fetchJobs();
      } catch (err) {
        console.error("Polling error:", err);
      }

      // Recursively call itself after 10 seconds.
      // This guarantees fresh state memory on every single loop!
      if (isMounted) {
        timerId = setTimeout(runPolling, 10000);
      }
    };

    if (currentUser) {
      runPolling(); // Start the loop when logged in
    } else {
      setNotifications([]);
    }

    // Cleanup function when component unmounts
    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, [currentUser]);

  const showAlert = (title, message) =>
    setModalConfig({ type: "alert", title, message });
  const showConfirm = (title, message, onConfirm) =>
    setModalConfig({ type: "confirm", title, message, onConfirm });

  const navigateToScreen = (screen) => {
    if (screen === "dashboard") {
      fetchJobs(); // Force refresh when returning to feed
      navigate("/");
    }
    if (screen === "auth") navigate("/auth");
    if (screen === "new_quote") navigate("/new-quote");
    if (screen === "job_details") navigate("/job-details");
  };

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================
  const resetBidForms = () => {
    setEditingBidId(null);
    setNewBidForm({
      amount: "",
      notes: "",
      guestBusinessName: "",
      guestPhone: "",
      guestEmail: "",
      guestLocation: "",
      zipCode: "",
      cityState: "",
      guestAgreed: false,
    });
    setNewBidFile(null);
    setSignatureWarning(false);
    setSignatureVerified(false);
  };

  const handleQuoteZipChange = async (e) => {
    const zip = e.target.value.replace(/\D/g, "").slice(0, 5);
    setNewQuoteForm((prev) => ({
      ...prev,
      zipCode: zip,
      cityState: zip.length < 5 ? "" : prev.cityState,
    }));
    if (zip.length === 5) {
      try {
        const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
        if (res.ok) {
          const data = await res.json();
          setNewQuoteForm((prev) => ({
            ...prev,
            cityState: `${data.places[0]["place name"]}, ${data.places[0]["state abbreviation"]}`,
          }));
        }
      } catch (err) {}
    }
  };

  const handleBidZipChange = async (e) => {
    const zip = e.target.value.replace(/\D/g, "").slice(0, 5);
    setNewBidForm((prev) => ({
      ...prev,
      zipCode: zip,
      cityState: zip.length < 5 ? "" : prev.cityState,
    }));
    if (zip.length === 5) {
      try {
        const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
        if (res.ok) {
          const data = await res.json();
          setNewBidForm((prev) => ({
            ...prev,
            cityState: `${data.places[0]["place name"]}, ${data.places[0]["state abbreviation"]}`,
          }));
        }
      } catch (err) {}
    }
  };

  const toggleComments = (bidId) =>
    setExpandedComments((prev) => ({ ...prev, [bidId]: !prev[bidId] }));

  const getUniqueGuestName = (jobId) => {
    if (guestNamesByJob[jobId]) return guestNamesByJob[jobId];
    const newName = `Guest_${Math.floor(1000 + Math.random() * 9000)}`;
    setGuestNamesByJob((prev) => ({ ...prev, [jobId]: newName }));
    return newName;
  };

  // ==========================================
  // FULL-STACK API CALLS
  // ==========================================

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint =
      authMode === "login" ? "/api/auth/login" : "/api/auth/register";
    try {
      const response = await fetch(`https://bid-versus-backend.onrender.com${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: authForm.name,
          email: authForm.email,
          password: authForm.password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("bidVersusToken", data.token);
        setCurrentUser({
          id: data._id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          isVerified: true,
        });
        setAuthForm({ name: "", email: "", password: "" });
        navigateToScreen("dashboard");
        setViewMode("customer");
      } else {
        showAlert("Authentication Failed", data.message);
      }
    } catch (error) {
      showAlert("Connection Error", "Could not connect to server.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("bidVersusToken");
    setCurrentUser(null);
    navigateToScreen("auth");
    setAuthForm({ name: "", email: "" });
  };

  const handleCreateQuote = async (e) => {
    e.preventDefault();
    if (!currentUser && !newQuoteForm.guestAgreed) {
      return showAlert(
        "Action Required",
        "You must agree to the terms to continue as a guest.",
      );
    }

    if (!uploadedFile)
      return showAlert("Missing File", "Please upload a document.");

    if (
      !currentUser &&
      (!newQuoteForm.guestName ||
        !newQuoteForm.guestPhone ||
        !newQuoteForm.guestEmail)
    ) {
      return showAlert(
        "Missing Information",
        "Please provide your contact info.",
      );
    }

    let effectiveUser = currentUser || {
      name: newQuoteForm.guestName,
      email: newQuoteForm.guestEmail,
    };

    const formData = new FormData();
    formData.append("title", newQuoteForm.title);
    formData.append(
      "category",
      newQuoteForm.category === "Other"
        ? newQuoteForm.customCategory || "Other"
        : newQuoteForm.category,
    );
    formData.append("description", newQuoteForm.description);
    formData.append("originalQuote", newQuoteForm.originalQuote);
    formData.append(
      "location",
      newQuoteForm.cityState || newQuoteForm.zipCode || "Location Not Provided",
    );
    formData.append("zipCode", newQuoteForm.zipCode);
    formData.append("author", effectiveUser.name);

    formData.append("contactName", effectiveUser.name);
    formData.append("contactEmail", effectiveUser.email);
    formData.append(
      "contactPhone",
      newQuoteForm.guestPhone || "No phone provided",
    );

    formData.append("document", uploadedFile);

    try {
      const token = currentUser ? localStorage.getItem("bidVersusToken") : null;

      const response = await fetch("https://bid-versus-backend.onrender.com/api/jobs", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return showAlert("Action Required", data.message);
      }

      if (data.token && data.user) {
        localStorage.setItem("bidVersusToken", data.token);
        setCurrentUser({
          id: data.user._id || data.user.id,
          name: data.user.name,
          email: data.user.email,
          isVerified: false,
        });
        showAlert(
          "Success!",
          `Your estimate was posted! We automatically created an account for ${data.user.email} and signed you in.`,
        );
      } else {
        showAlert(
          "Quote Posted!",
          "Your request is now live for providers to review.",
        );
      }

      await fetchJobs();
      navigateToScreen("dashboard");
      setNewQuoteForm({
        title: "",
        category: "Auto",
        customCategory: "",
        description: "",
        originalQuote: "",
        guestName: "",
        guestPhone: "",
        guestEmail: "",
        zipCode: "",
        cityState: "",
      });
      setUploadedFile(null);
    } catch (error) {
      console.error("Submission Error:", error);
      showAlert("Error", "Could not submit quote. Check your connection.");
    }
  };

  const handleSubmitBid = async (e, forceSubmit = false) => {
    if (e) e.preventDefault();
    if (!currentUser && !editingBidId && !newBidForm.guestAgreed) {
      return showAlert(
        "Action Required",
        "You must agree to the terms to continue as a guest.",
      );
    }

    if (!newBidFile && !editingBidId) {
      return showAlert("Missing Document", "Please upload a document.");
    }

    let isVerified = signatureVerified;

    const shouldRunAI = newBidFile && !forceSubmit && !isVerified;

    if (shouldRunAI) {
      setIsAnalyzingSignature(true);
      setSignatureWarning(false);
      try {
        const fileToBase64 = (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(",")[1]);
            reader.onerror = (error) => reject(error);
          });

        const base64Data = await fileToBase64(newBidFile);
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: "Look closely at this document. Does it contain a visible handwritten or digital signature anywhere? Reply strictly with 'YES' or 'NO'.",
                    },
                    {
                      inlineData: {
                        mimeType: newBidFile.type,
                        data: base64Data,
                      },
                    },
                  ],
                },
              ],
            }),
          },
        );

        const data = await response.json();
        const textResponse =
          data.candidates?.[0]?.content?.parts?.[0]?.text
            ?.trim()
            .toUpperCase() || "NO";

        if (textResponse.includes("YES")) {
          isVerified = true;
          setSignatureVerified(true);
        } else {
          setSignatureWarning(true);
          setIsAnalyzingSignature(false);
          return;
        }
      } catch (err) {
        setSignatureWarning(true);
        setIsAnalyzingSignature(false);
        return;
      }
      setIsAnalyzingSignature(false);
    }

    let effectiveUser = currentUser || {
      name: newBidForm.guestBusinessName,
      email: newBidForm.guestEmail,
    };

    const formData = new FormData();
    formData.append("jobId", selectedJob._id || selectedJob.id);
    formData.append("amount", newBidForm.amount);
    formData.append("notes", newBidForm.notes);
    formData.append("zipCode", newBidForm.zipCode);
    formData.append("location", newBidForm.cityState || newBidForm.zipCode);
    formData.append("providerName", effectiveUser.name);
    formData.append(
      "contactPhone",
      newBidForm.guestPhone || "No phone provided",
    );
    formData.append("contactEmail", effectiveUser.email);
    formData.append(
      "providerContact[location]",
      newBidForm.cityState || newBidForm.zipCode || "Location Not Provided",
    );
    formData.append("verifiedByTopDogg", isVerified);

    if (newBidFile) {
      formData.append("document", newBidFile);
    }

    try {
      const token = currentUser ? localStorage.getItem("bidVersusToken") : null;
      const url = editingBidId
        ? `https://bid-versus-backend.onrender.com/api/bids/${editingBidId}`
        : "https://bid-versus-backend.onrender.com/api/bids";
      const method = editingBidId ? "PUT" : "POST";
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(url, {
        method,
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return showAlert("Action Required", data.message);
      }

      if (data.token && data.user) {
        localStorage.setItem("bidVersusToken", data.token);
        setCurrentUser({
          id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          isVerified: false,
        });
        showAlert(
          "Success!",
          `Your bid was placed! We automatically created a provider account for ${data.user.email} and signed you in.`,
        );
      } else {
        showAlert(
          "Success",
          editingBidId
            ? "Bid updated successfully!"
            : "Offer submitted successfully!",
        );
      }

      await fetchJobs();
      resetBidForms();
    } catch (error) {
      showAlert("Error", "Server connection failed.");
    }
  };

  const handleSendCustomerCounter = async (bidId) => {
    const amount = counterAmounts[bidId];
    if (!amount) return;

    try {
      const token = localStorage.getItem("bidVersusToken");
      await fetch(`https://bid-versus-backend.onrender.com/api/bids/${bidId}/counter`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });
      setShowCounter((prev) => ({ ...prev, [bidId]: false }));
      await fetchJobs();
    } catch (error) {
      console.error(error);
    }
  };

  const handleProviderResponse = async (bidId, action, newAmount = null) => {
    try {
      const token = localStorage.getItem("bidVersusToken");
      await fetch(`https://bid-versus-backend.onrender.com/api/bids/${bidId}/respond-counter`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, newAmount }),
      });
      await fetchJobs();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAcceptOffer = async (jobId, bidId) => {
    try {
      const token = localStorage.getItem("bidVersusToken");
      const response = await fetch(
        `https://bid-versus-backend.onrender.com/api/jobs/${jobId}/accept`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bidId }),
        },
      );
      if (response.ok) {
        await fetchJobs();
        showAlert(
          "Offer Accepted",
          "Offer accepted! The provider has been notified.",
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUnacceptOffer = (jobId) => {
    showConfirm(
      "Unaccept Offer",
      "Are you sure you want to unaccept this offer?",
      async () => {
        try {
          const token = localStorage.getItem("bidVersusToken");
          const response = await fetch(
            `https://bid-versus-backend.onrender.com/api/jobs/${jobId}/unaccept`,
            {
              method: "PUT",
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (response.ok) fetchJobs();
        } catch (error) {
          console.error(error);
        }
      },
    );
  };

  const handleRescindOffer = (jobId, bidId) => {
    showConfirm(
      "Rescind Offer",
      "Are you sure you want to rescind your offer?",
      async () => {
        try {
          const token = localStorage.getItem("bidVersusToken");
          const response = await fetch(
            `https://bid-versus-backend.onrender.com/api/bids/${bidId}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (response.ok) {
            await fetchJobs();
            setEditingBidId(null);
          }
        } catch (error) {
          console.error(error);
        }
      },
    );
  };

  const handleAddJobComment = async (jobId) => {
    if (!jobCommentInput.trim()) return;
    const authorName = currentUser
      ? currentUser.name
      : getUniqueGuestName(jobId);

    try {
      const response = await fetch(
        `https://bid-versus-backend.onrender.com/api/jobs/${jobId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ author: authorName, text: jobCommentInput }),
        },
      );
      if (response.ok) {
        setJobCommentInput("");
        fetchJobs();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddComment = async (jobId, bidId) => {
    const text = commentInputs[bidId];
    if (!text || text.trim() === "") return;

    const authorName = currentUser
      ? currentUser.name
      : getUniqueGuestName(jobId);

    try {
      const response = await fetch(
        `https://bid-versus-backend.onrender.com/api/bids/${bidId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ author: authorName, text }),
        },
      );

      if (response.ok) {
        // Clear the input box
        setCommentInputs((prev) => ({ ...prev, [bidId]: "" }));
        // Force the screen to instantly pull the new comment from the database
        fetchJobs();
      }
    } catch (error) {
      console.error("Error saving bid comment:", error);
    }
  };

  const handleCounterOfferSubmit = (jobId, bidId) => {
    if (!counterAmounts[bidId]) return;
    const updatedJobs = jobs.map((job) => {
      if (job._id === jobId || job.id === jobId) {
        const updatedBids = job.bids.map((bid) => {
          if (bid._id === bidId || bid.id === bidId)
            return { ...bid, counterAmount: parseFloat(counterAmounts[bidId]) };
          return bid;
        });
        return { ...job, bids: updatedBids };
      }
      return job;
    });
    setJobs(updatedJobs);
    if (selectedJob && (selectedJob._id === jobId || selectedJob.id === jobId))
      setSelectedJob(
        updatedJobs.find((j) => j._id === jobId || j.id === jobId),
      );
    setShowCounter((prev) => ({ ...prev, [bidId]: false }));
  };

  const getLowestBid = (bids) => {
    if (!bids || bids.length === 0) return null;
    return Math.min(...bids.map((b) => b.amount));
  };

  // Derived state
  const activeNotifications = notifications.filter(
    (n) => viewMode === "provider",
  );
  const unreadCount = activeNotifications.filter((n) => !n.read).length;

  // Clean, derived calculation for existing bid
  const existingBidForCurrentJob =
    selectedJob && viewMode === "provider"
      ? selectedJob.bids.find(
          (b) =>
            myBids.includes(b._id || b.id) ||
            (currentUser && b.providerName === currentUser.name),
        )
      : null;

  // Trigger step 1 (The confirmation)
  const triggerDeleteAccount = () => {
    showConfirm(
      "Delete Account",
      "Are you sure you want to permanently delete your account, jobs, and bids? This cannot be undone.",
      () => {
        // If they click 'Yes', open the password prompt
        setShowPasswordPrompt(true);
      },
    );
  };

  // Trigger step 2 (The actual deletion)
  const submitDeleteAccount = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("bidVersusToken");

      // Determine what to send to the backend
      const payload = currentUser.isVerified
        ? { password: deleteInput }
        : { emailConfirm: deleteInput };

      const res = await fetch("https://bid-versus-backend.onrender.com/api/auth/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        setShowPasswordPrompt(false);
        setDeleteInput("");
        handleLogout();
        showAlert(
          "Account Deleted",
          "Your account and all data have been successfully removed.",
        );
      } else {
        showAlert("Action Failed", data.message);
      }
    } catch (err) {
      showAlert("Error", "Could not connect to server to delete account.");
    }
  };

  return (
    <div className="app-wrapper">
      <Navbar
        currentUser={currentUser}
        viewMode={viewMode}
        setViewMode={setViewMode}
        setCurrentScreen={navigateToScreen}
        resetBidForms={resetBidForms}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        unreadCount={unreadCount}
        notifications={notifications}
        fetchJobs={fetchJobs}
        setNotifications={async (newNotifs) => {
          setNotifications(newNotifs);
          const token = localStorage.getItem("bidVersusToken");
          if (token) {
            await fetch("https://bid-versus-backend.onrender.com/api/notifications/read", {
              method: "PUT",
              headers: { Authorization: `Bearer ${token}` },
            });
          }
        }}
        activeNotifications={activeNotifications}
        jobs={jobs}
        setSelectedJob={setSelectedJob}
        handleLogout={handleLogout}
        triggerDeleteAccount={triggerDeleteAccount}
      />
      <main className="main-container">
        <Routes>
          <Route
            path="/"
            element={
              viewMode === "provider" ? (
                <ProviderDashboard
                  jobs={jobs}
                  myBidJobIds={myBidJobIds}
                  currentUser={currentUser}
                  setSelectedJob={setSelectedJob}
                  setCurrentScreen={navigateToScreen}
                  resetBidForms={resetBidForms}
                />
              ) : (
                <CustomerDashboard
                  jobs={jobs}
                  getLowestBid={getLowestBid}
                  setSelectedJob={setSelectedJob}
                  setCurrentScreen={navigateToScreen}
                  resetBidForms={resetBidForms}
                />
              )
            }
          />
          <Route
            path="/auth"
            element={
              <AuthScreen
                authMode={authMode}
                setAuthMode={setAuthMode}
                authForm={authForm}
                setAuthForm={setAuthForm}
                handleAuth={handleAuth}
              />
            }
          />
          <Route
            path="/new-quote"
            element={
              <NewQuoteForm
                currentUser={currentUser}
                newQuoteForm={newQuoteForm}
                setNewQuoteForm={setNewQuoteForm}
                handleCreateQuote={handleCreateQuote}
                uploadedFile={uploadedFile}
                setUploadedFile={setUploadedFile}
                handleQuoteZipChange={handleQuoteZipChange}
                setCurrentScreen={navigateToScreen}
              />
            }
          />
          <Route
            path="/job-details"
            element={
              selectedJob ? (
                <JobDetails
                  selectedJob={selectedJob}
                  currentUser={currentUser}
                  viewMode={viewMode}
                  setCurrentScreen={navigateToScreen}
                  resetBidForms={resetBidForms}
                  setViewingDocument={setViewingDocument}
                  jobCommentInput={jobCommentInput}
                  setJobCommentInput={setJobCommentInput}
                  handleAddJobComment={handleAddJobComment}
                  existingBidForCurrentJob={existingBidForCurrentJob}
                  editingBidId={editingBidId}
                  setEditingBidId={setEditingBidId}
                  newBidForm={newBidForm}
                  setNewBidForm={setNewBidForm}
                  handleRescindOffer={handleRescindOffer}
                  handleSubmitBid={handleSubmitBid}
                  newBidFile={newBidFile}
                  setNewBidFile={setNewBidFile}
                  setSignatureWarning={setSignatureWarning}
                  setSignatureVerified={setSignatureVerified}
                  signatureWarning={signatureWarning}
                  isAnalyzingSignature={isAnalyzingSignature}
                  handleBidZipChange={handleBidZipChange}
                  handleUnacceptOffer={handleUnacceptOffer}
                  handleAcceptOffer={handleAcceptOffer}
                  showCounter={showCounter}
                  setShowCounter={setShowCounter}
                  counterAmounts={counterAmounts}
                  setCounterAmounts={setCounterAmounts}
                  handleCounterOfferSubmit={handleCounterOfferSubmit}
                  expandedComments={expandedComments}
                  toggleComments={toggleComments}
                  commentInputs={commentInputs}
                  setCommentInputs={setCommentInputs}
                  handleAddComment={handleAddComment}
                  fetchJobs={fetchJobs} /* FIX: Pass fetchJobs explicitly! */
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route
            path="/verify-email"
            element={<VerifyEmail setCurrentUser={setCurrentUser} />}
          />
        </Routes>
        {/* === NEW: DYNAMIC DELETE PROMPT MODAL === */}
        {showPasswordPrompt && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                backgroundColor: "#1e293b",
                padding: "2rem",
                borderRadius: "0.5rem",
                width: "90%",
                maxWidth: "400px",
                border: "1px solid #334155",
              }}
            >
              <h3
                style={{
                  color: "white",
                  marginBottom: "0.5rem",
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                }}
              >
                Security Check
              </h3>

              <p
                style={{
                  color: "#94a3b8",
                  marginBottom: "1.5rem",
                  fontSize: "0.875rem",
                }}
              >
                {currentUser?.isVerified
                  ? "Please enter your password to confirm permanent deletion."
                  : `As an unverified guest, please type your email (${currentUser?.email}) to confirm permanent deletion.`}
              </p>

              <form onSubmit={submitDeleteAccount}>
                <input
                  type={currentUser?.isVerified ? "password" : "email"}
                  required
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder={
                    currentUser?.isVerified
                      ? "Your Password"
                      : "your.email@example.com"
                  }
                  className="form-input"
                  style={{ width: "100%", marginBottom: "1.5rem" }}
                />
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordPrompt(false);
                      setDeleteInput("");
                    }}
                    className="btn-action"
                    style={{ backgroundColor: "transparent", color: "#cbd5e1" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ backgroundColor: "#ef4444" }}
                  >
                    Permanently Delete
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Modals
        viewingDocument={viewingDocument}
        setViewingDocument={setViewingDocument}
        modalConfig={modalConfig}
        setModalConfig={setModalConfig}
      />
    </div>
  );
}
