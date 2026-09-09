import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  Filter,
  Flame,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  Wrench,
  X,
} from "lucide-react";

const API_URL = "http://localhost:8080/api";

const CATEGORIES = [
  "IT",
  "ELECTRICAL",
  "CLEANING",
  "PLUMBING",
  "INFRASTRUCTURE",
  "OTHER",
];

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "IT",
  priority: "MEDIUM",
  location: "",
};

function getToken() {
  return localStorage.getItem("token");
}

function getUsername() {
  return localStorage.getItem("username") || "";
}

function getRole() {
  return localStorage.getItem("role") || "USER";
}

function isAdminRole(role) {
  return String(role).toUpperCase().includes("ADMIN");
}

function normalizeIssue(item) {
  return {
    id: item?.id ?? item?.issueId ?? "",
    title: item?.title ?? "Untitled Issue",
    description: item?.description ?? "",
    category: item?.category ?? "OTHER",
    priority: item?.priority ?? "MEDIUM",
    status: item?.status ?? "OPEN",
    location:
      item?.location ??
      item?.building ??
      item?.room ??
      "Campus",
    building: item?.building ?? item?.location ?? "Campus",
    floor: item?.floor ?? "",
    createdAt:
      item?.createdAt ??
      item?.createdDate ??
      item?.reportedDate ??
      "",
    createdBy:
      item?.createdBy ??
      item?.reportedBy ??
      "User",
    raw: item,
  };
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    if (typeof data === "object" && data) {
      message = data.message || data.error || message;
    } else if (data) {
      message = String(data);
    }

    throw new Error(message);
  }

  return data;
}

function formatDate(value) {
  if (!value) return "Recently";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusLabel(status) {
  return String(status || "OPEN")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getPriorityClass(priority) {
  if (priority === "CRITICAL") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (priority === "HIGH") {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }

  if (priority === "MEDIUM") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  return "bg-slate-100 text-slate-600 border-slate-200";
}

function getStatusClass(status) {
  if (status === "OPEN") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (status === "IN_PROGRESS") {
    return "bg-sky-50 text-sky-700 border-sky-200";
  }

  if (status === "RESOLVED") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  return "bg-slate-100 text-slate-600 border-slate-200";
}

export default function App() {
  /* =========================================================
     AUTH
  ========================================================= */

  const [token, setToken] = useState(getToken());
  const [username, setUsername] = useState(getUsername());
  const [role, setRole] = useState(getRole());

  const [authMode, setAuthMode] = useState("login");

  const [authForm, setAuthForm] = useState({
    username: "",
    password: "",
  });

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  /* =========================================================
     APP
  ========================================================= */

  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [apiError, setApiError] = useState("");
  const [toast, setToast] = useState("");

  /* =========================================================
     FILTERS
  ========================================================= */

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");

  /* =========================================================
     PAGINATION
  ========================================================= */

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  /* =========================================================
     REPORT / EDIT MODAL
  ========================================================= */

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [savingIssue, setSavingIssue] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);

  /* =========================================================
     TOAST
  ========================================================= */

  const showToast = (message) => {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 3500);
  };

  /* =========================================================
     LOAD ISSUES WHEN LOGGED IN
  ========================================================= */

  useEffect(() => {
    if (token) {
      loadIssues(0);
    }
  }, [token]);

  /* =========================================================
     LOAD ISSUES
  ========================================================= */

  const loadIssues = async (requestedPage = page) => {
    if (!token) return;

    try {
      setLoading(true);
      setApiError("");

      const data = await apiRequest(
        `${API_URL}/issues/page?page=${requestedPage}&size=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const records = Array.isArray(data?.content)
        ? data.content
        : Array.isArray(data)
          ? data
          : [];

      setIssues(records.map(normalizeIssue));

      if (data && typeof data === "object") {
        setTotalPages(Number(data.totalPages || 0));
      } else {
        setTotalPages(1);
      }

      setPage(requestedPage);
    } catch (error) {
      console.error(error);

      setApiError(
        error.message || "Unable to load issues.",
      );

      if (
        error.message?.includes("401") ||
        error.message?.includes("403")
      ) {
        logout();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =========================================================
     AUTH FORM
  ========================================================= */

  const handleAuthInput = (event) => {
    setAuthForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();

    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    try {
      const endpoint =
        authMode === "login"
          ? "/auth/login"
          : "/auth/register";

      const data = await apiRequest(API_URL + endpoint, {
        method: "POST",
        body: JSON.stringify(authForm),
      });

      if (authMode === "register") {
        setAuthMode("login");

        setAuthSuccess(
          "Registration successful. Please sign in.",
        );

        setAuthForm({
          username: authForm.username,
          password: "",
        });

        return;
      }

      const receivedToken =
        data?.token ??
        data?.accessToken ??
        data?.jwt;

      if (!receivedToken) {
        throw new Error(
          "Login response did not contain a JWT token.",
        );
      }

      const receivedUsername =
        data?.username || authForm.username;

      const receivedRole =
        data?.role ||
        data?.userRole ||
        "USER";

      localStorage.setItem(
        "token",
        receivedToken,
      );

      localStorage.setItem(
        "username",
        receivedUsername,
      );

      localStorage.setItem(
        "role",
        receivedRole,
      );

      setToken(receivedToken);
      setUsername(receivedUsername);
      setRole(receivedRole);

      setAuthForm({
        username: "",
        password: "",
      });

      showToast("Login successful.");
    } catch (error) {
      console.error(error);
      setAuthError(
        error.message || "Authentication failed.",
      );
    } finally {
      setAuthLoading(false);
    }
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    setToken(null);
    setUsername("");
    setRole("");

    setIssues([]);
    setSelectedIssue(null);
    setActiveTab("dashboard");
    setMobileMenuOpen(false);
  }

  /* =========================================================
     REPORT FORM
  ========================================================= */

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setReportModalOpen(true);
  };

  const openEditModal = (issue) => {
    setEditingId(issue.id);

    setForm({
      title: issue.title || "",
      description: issue.description || "",
      category: issue.category || "IT",
      priority: issue.priority || "MEDIUM",
      location:
        issue.location ||
        issue.building ||
        "",
    });

    setSelectedIssue(null);
    setReportModalOpen(true);
  };

  const handleFormInput = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleIssueSubmit = async (event) => {
    event.preventDefault();

    if (!token) return;

    if (
      !form.title.trim() ||
      !form.description.trim()
    ) {
      setApiError(
        "Please provide title and description.",
      );
      return;
    }

    setSavingIssue(true);
    setApiError("");

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      priority: form.priority,
      location: form.location.trim(),
    };

    try {
      if (editingId) {
        await apiRequest(
          `${API_URL}/issues/${editingId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          },
        );

        showToast("Issue updated successfully.");
      } else {
        await apiRequest(`${API_URL}/issues`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        showToast("Issue reported successfully.");
      }

      setReportModalOpen(false);
      resetForm();

      await loadIssues(0);
    } catch (error) {
      console.error(error);
      setApiError(error.message);
    } finally {
      setSavingIssue(false);
    }
  };

  /* =========================================================
     STATUS UPDATE
  ========================================================= */

  const updateStatus = async (
    issueId,
    nextStatus,
  ) => {
    try {
      await apiRequest(
        `${API_URL}/issues/${issueId}/status?status=${encodeURIComponent(
          nextStatus,
        )}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setIssues((previous) =>
        previous.map((issue) =>
          issue.id === issueId
            ? {
                ...issue,
                status: nextStatus,
              }
            : issue,
        ),
      );

      setSelectedIssue((previous) =>
        previous?.id === issueId
          ? {
              ...previous,
              status: nextStatus,
            }
          : previous,
      );

      showToast(
        `Issue changed to ${getStatusLabel(nextStatus)}.`,
      );
    } catch (error) {
      console.error(error);
      setApiError(error.message);
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const deleteIssue = async (issueId) => {
    if (!isAdminRole(role)) {
      showToast("Admin access is required.");
      return;
    }

    const confirmed = window.confirm(
      "Delete this issue permanently?",
    );

    if (!confirmed) return;

    try {
      await apiRequest(
        `${API_URL}/issues/${issueId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setIssues((previous) =>
        previous.filter(
          (issue) => issue.id !== issueId,
        ),
      );

      setSelectedIssue(null);

      showToast("Issue deleted successfully.");
    } catch (error) {
      console.error(error);
      setApiError(error.message);
    }
  };

  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = async () => {
    setRefreshing(true);

    await loadIssues(page);

    showToast("Dashboard refreshed.");
  };

  /* =========================================================
     FILTERING
  ========================================================= */

  const filteredIssues = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return issues.filter((issue) => {
      const searchable = [
        issue.id,
        issue.title,
        issue.description,
        issue.category,
        issue.priority,
        issue.status,
        issue.location,
        issue.building,
        issue.floor,
        issue.createdBy,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !search ||
        searchable.includes(search);

      const matchesStatus =
        filterStatus === "ALL" ||
        issue.status === filterStatus;

      const matchesPriority =
        filterPriority === "ALL" ||
        issue.priority === filterPriority;

      const matchesCategory =
        filterCategory === "ALL" ||
        issue.category === filterCategory;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory
      );
    });
  }, [
    issues,
    searchTerm,
    filterStatus,
    filterPriority,
    filterCategory,
  ]);

  /* =========================================================
     METRICS
  ========================================================= */

  const metrics = useMemo(() => {
    const total = issues.length;

    const open = issues.filter(
      (issue) => issue.status === "OPEN",
    ).length;

    const inProgress = issues.filter(
      (issue) =>
        issue.status === "IN_PROGRESS",
    ).length;

    const resolved = issues.filter(
      (issue) =>
        issue.status === "RESOLVED" ||
        issue.status === "CLOSED",
    ).length;

    const critical = issues.filter(
      (issue) =>
        issue.priority === "CRITICAL",
    ).length;

    const high = issues.filter(
      (issue) =>
        issue.priority === "HIGH",
    ).length;

    return {
      total,
      open,
      inProgress,
      resolved,
      critical,
      high,
    };
  }, [issues]);

  /* =========================================================
     CATEGORY ANALYTICS
  ========================================================= */

  const categoryStats = useMemo(() => {
    const counter = {};

    issues.forEach((issue) => {
      const category =
        issue.category || "OTHER";

      counter[category] =
        (counter[category] || 0) + 1;
    });

    return Object.entries(counter)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [issues]);

  const initials = (
    username || "User"
  )
    .slice(0, 2)
    .toUpperCase();

  /* =========================================================
     AUTH SCREEN
  ========================================================= */

  if (!token) {
    return (
      <div className="min-h-screen w-full flex bg-slate-950">
        <section className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 text-white p-14 xl:p-20 flex-col justify-between">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-500/10" />
          <div className="absolute -bottom-40 -left-20 w-[32rem] h-[32rem] rounded-full bg-indigo-500/10" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/25">
              <Building2 className="w-6 h-6" />
            </div>

            <div>
              <div className="text-xl font-black">
                Campus
                <span className="text-blue-400">
                  Connect
                </span>
              </div>

              <div className="text-[9px] text-slate-400 uppercase tracking-[0.22em] font-bold">
                Smart Campus Platform
              </div>
            </div>
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-200 text-[10px] font-black tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              FULL-STACK PLATFORM
            </div>

            <h1 className="mt-6 text-5xl xl:text-6xl font-black leading-[1.02] tracking-tight">
              Make campus
              <span className="block text-blue-400">
                smarter together.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-slate-300 leading-7 text-sm xl:text-base">
              Report campus issues, track response
              progress and give administrators the
              visibility they need to act quickly.
            </p>

            <div className="mt-10 space-y-5">
              {[
                {
                  icon: ClipboardList,
                  title: "Simple issue reporting",
                  text: "Report problems with useful location, category and priority details.",
                },
                {
                  icon: ShieldCheck,
                  title: "Secure access",
                  text: "JWT authentication and role-based authorization.",
                },
                {
                  icon: BarChart3,
                  title: "Actionable insights",
                  text: "Monitor open, active, critical and resolved issues.",
                },
              ].map(
                ({
                  icon: Icon,
                  title,
                  text,
                }) => (
                  <div
                    key={title}
                    className="flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-300">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="font-bold text-sm">
                        {title}
                      </div>

                      <div className="text-xs text-slate-400 mt-1 leading-5 max-w-md">
                        {text}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="relative z-10 text-xs text-slate-500">
            Java + Spring Boot + MySQL + React
          </div>
        </section>

        <section className="flex-1 min-h-screen bg-slate-50 flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex justify-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>

                <div className="text-xl font-black text-slate-900">
                  Campus
                  <span className="text-blue-600">
                    Connect
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-slate-200/60 p-7 sm:p-9">
              <div className="mb-7">
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-600">
                  Welcome to CampusConnect
                </p>

                <h2 className="mt-2 text-3xl font-black text-slate-900">
                  {authMode === "login"
                    ? "Sign in"
                    : "Create account"}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {authMode === "login"
                    ? "Access your smart campus dashboard."
                    : "Join the campus issue reporting platform."}
                </p>
              </div>

              <div className="p-1 bg-slate-100 rounded-xl grid grid-cols-2 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                    setAuthSuccess("");
                  }}
                  className={`py-2.5 rounded-lg text-sm font-black transition ${
                    authMode === "login"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  Sign in
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setAuthError("");
                    setAuthSuccess("");
                  }}
                  className={`py-2.5 rounded-lg text-sm font-black transition ${
                    authMode === "register"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  Register
                </button>
              </div>

              {authError && (
                <div className="mb-4 flex gap-2 p-3 rounded-xl border border-red-200 bg-red-50 text-xs font-semibold text-red-700">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {authError}
                </div>
              )}

              {authSuccess && (
                <div className="mb-4 flex gap-2 p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {authSuccess}
                </div>
              )}

              <form
                onSubmit={handleAuthSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Username
                  </label>

                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                    <input
                      name="username"
                      value={authForm.username}
                      onChange={handleAuthInput}
                      placeholder="Enter username"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Password
                  </label>

                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                    <input
                      name="password"
                      type="password"
                      value={authForm.password}
                      onChange={handleAuthInput}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-black shadow-lg shadow-blue-600/20 transition disabled:opacity-60"
                >
                  {authLoading
                    ? "Please wait..."
                    : authMode === "login"
                      ? "Sign in"
                      : "Create account"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    );
  }

  /* =========================================================
     DASHBOARD
  ========================================================= */

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100 text-slate-800">
      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-white flex flex-col transform transition-transform duration-300 lg:static lg:translate-x-0 shrink-0 ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* BRAND */}
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>

            <div>
              <div className="text-lg font-black">
                Campus
                <span className="text-blue-400">
                  Connect
                </span>
              </div>

              <div className="text-[9px] uppercase tracking-[0.18em] font-bold text-slate-500">
                Smart Campus Platform
              </div>
            </div>

            <button
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className="ml-auto lg:hidden p-2 rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* NAV */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
            Workspace
          </p>

          <nav className="space-y-1">
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition ${
                activeTab === "dashboard"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={() => {
                setActiveTab("issues");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition ${
                activeTab === "issues"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <ClipboardList className="w-4 h-4" />

              <span className="flex-1 text-left">
                Issues
              </span>

              <span className="text-[10px] px-2 py-1 rounded-full bg-white/10">
                {issues.length}
              </span>
            </button>

            <button
              onClick={() => {
                openCreateModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/10 transition"
            >
              <Plus className="w-4 h-4" />
              Report Issue
            </button>

            <button
              onClick={() => {
                setActiveTab("analytics");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition ${
                activeTab === "analytics"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
          </nav>

          <p className="px-3 mt-8 mb-2 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
            Platform
          </p>

          <nav className="space-y-1">
            <button
              onClick={() =>
                showToast(
                  "CampusConnect API is connected.",
                )
              }
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              <Bell className="w-4 h-4" />
              Notifications
              <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />
            </button>

            <button
              onClick={() =>
                showToast(
                  "Settings are available on the backend.",
                )
              }
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </nav>
        </div>

        {/* USER */}
        <div className="p-4 border-t border-white/10">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-sm font-black">
                {initials}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold truncate">
                  {username || "User"}
                </p>

                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  {isAdminRole(role)
                    ? "ADMIN"
                    : "STUDENT / USER"}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-300 text-xs font-bold text-slate-400 transition"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div className="flex-1 min-w-0 h-full flex flex-col">
        {/* HEADER */}
        <header className="shrink-0 bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-6 xl:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setMobileMenuOpen(true)
              }
              className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-black text-blue-600">
                {activeTab === "dashboard"
                  ? "Overview"
                  : activeTab === "issues"
                    ? "Issue Repository"
                    : "Operations Analytics"}
              </p>

              <h1 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                {activeTab === "dashboard"
                  ? `Good day, ${
                      username || "User"
                    } 👋`
                  : activeTab === "issues"
                    ? "Campus Issues"
                    : "Campus Analytics"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleRefresh}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:border-blue-300 hover:text-blue-600 transition"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-lg shadow-blue-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">
                Report Issue
              </span>
            </button>

            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">
              {initials}
            </div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto">
          <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 xl:p-8 space-y-6">
            {apiError && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />

                <div className="flex-1">
                  <p className="text-sm font-black text-red-800">
                    Request failed
                  </p>

                  <p className="text-xs text-red-700 mt-1">
                    {apiError}
                  </p>
                </div>

                <button
                  onClick={() => setApiError("")}
                  className="text-red-400 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* =================================================
                DASHBOARD
            ================================================= */}

            {activeTab === "dashboard" && (
              <>
                {/* HERO */}
                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 text-white p-6 sm:p-8 xl:p-10 shadow-xl">
                  <div className="absolute -top-28 -right-16 w-80 h-80 rounded-full bg-blue-400/10" />
                  <div className="absolute -bottom-44 right-20 w-96 h-96 rounded-full bg-indigo-400/10" />

                  <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-black text-blue-300">
                      <Sparkles className="w-3.5 h-3.5" />
                      Smart campus operations
                    </div>

                    <h2 className="mt-3 text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight leading-tight">
                      Keep your campus
                      <span className="block text-blue-300">
                        moving forward.
                      </span>
                    </h2>

                    <p className="mt-4 max-w-xl text-sm sm:text-base text-blue-100/75 leading-7">
                      Report problems, track response
                      progress and make campus operations
                      more transparent.
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3">
                      <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white text-slate-900 text-xs font-black hover:bg-blue-50 transition"
                      >
                        <Plus className="w-4 h-4" />
                        Report an issue
                      </button>

                      <button
                        onClick={() =>
                          setActiveTab("issues")
                        }
                        className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white text-xs font-black hover:bg-white/15 transition"
                      >
                        View issue repository
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="hidden xl:flex absolute right-16 top-1/2 -translate-y-1/2">
                    <div className="w-48 h-48 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur flex items-center justify-center">
                      <Building2 className="w-28 h-28 text-blue-200/70" />
                    </div>
                  </div>
                </section>

                {/* KPI CARDS */}
                <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                  {[
                    [
                      "Total Issues",
                      metrics.total,
                      ClipboardList,
                      "blue",
                    ],
                    [
                      "Open",
                      metrics.open,
                      Clock3,
                      "amber",
                    ],
                    [
                      "In Progress",
                      metrics.inProgress,
                      Wrench,
                      "sky",
                    ],
                    [
                      "Resolved",
                      metrics.resolved,
                      CheckCircle2,
                      "emerald",
                    ],
                    [
                      "Critical",
                      metrics.critical,
                      Flame,
                      "red",
                    ],
                  ].map(
                    ([
                      label,
                      value,
                      Icon,
                      tone,
                    ]) => {
                      const colors = {
                        blue: "bg-blue-50 text-blue-600 border-blue-100",
                        amber:
                          "bg-amber-50 text-amber-600 border-amber-100",
                        sky: "bg-sky-50 text-sky-600 border-sky-100",
                        emerald:
                          "bg-emerald-50 text-emerald-600 border-emerald-100",
                        red: "bg-red-50 text-red-600 border-red-100",
                      };

                      return (
                        <div
                          key={label}
                          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg transition"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-wider font-black text-slate-500">
                              {label}
                            </span>

                            <div
                              className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colors[tone]}`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                          </div>

                          <div className="text-3xl font-black text-slate-900 mt-4">
                            {value}
                          </div>

                          <div className="text-[10px] text-slate-400 mt-1">
                            Live API data
                          </div>
                        </div>
                      );
                    },
                  )}
                </section>

                {/* RECENT + QUICK ACTIONS */}
                <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-black text-slate-900">
                          Recent issues
                        </h3>

                        <p className="text-[11px] text-slate-500 mt-1">
                          Latest issues returned by
                          the backend.
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setActiveTab("issues")
                        }
                        className="text-xs font-black text-blue-600"
                      >
                        View all →
                      </button>
                    </div>

                    {loading ? (
                      <div className="p-12 text-center">
                        <RefreshCw className="w-7 h-7 text-blue-600 animate-spin mx-auto" />

                        <p className="text-xs font-bold text-slate-500 mt-3">
                          Loading live issues...
                        </p>
                      </div>
                    ) : issues.length === 0 ? (
                      <div className="p-12 text-center">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 className="w-7 h-7" />
                        </div>

                        <h4 className="text-sm font-black text-slate-900 mt-4">
                          No issues found
                        </h4>

                        <p className="text-xs text-slate-500 mt-1">
                          Create your first campus
                          issue.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {issues
                          .slice(0, 5)
                          .map((issue) => (
                            <button
                              key={issue.id}
                              onClick={() =>
                                setSelectedIssue(
                                  issue,
                                )
                              }
                              className="w-full text-left p-4 hover:bg-slate-50 transition"
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                  <ClipboardList className="w-4 h-4" />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-mono text-[10px] font-black text-blue-600">
                                      #{issue.id}
                                    </span>

                                    <span
                                      className={`px-2 py-1 rounded-full border text-[9px] font-black ${getPriorityClass(
                                        issue.priority,
                                      )}`}
                                    >
                                      {issue.priority}
                                    </span>

                                    <span
                                      className={`px-2 py-1 rounded-full border text-[9px] font-black ${getStatusClass(
                                        issue.status,
                                      )}`}
                                    >
                                      {getStatusLabel(
                                        issue.status,
                                      )}
                                    </span>
                                  </div>

                                  <h4 className="text-sm font-black text-slate-900 mt-2 truncate">
                                    {issue.title}
                                  </h4>

                                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] text-slate-500">
                                    <span className="inline-flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-rose-500" />
                                      {issue.location}
                                    </span>

                                    <span>
                                      {formatDate(
                                        issue.createdAt,
                                      )}
                                    </span>
                                  </div>
                                </div>

                                <ArrowRight className="w-4 h-4 text-slate-300 mt-2" />
                              </div>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>

                      <div>
                        <h3 className="text-sm font-black text-slate-900">
                          Quick actions
                        </h3>

                        <p className="text-[11px] text-slate-500">
                          Common campus tasks.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      <button
                        onClick={openCreateModal}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 hover:bg-blue-100 transition"
                      >
                        <span className="flex items-center gap-3">
                          <Plus className="w-4 h-4" />
                          <span className="text-xs font-black">
                            Report issue
                          </span>
                        </span>

                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          setActiveTab("issues")
                        }
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 transition"
                      >
                        <span className="flex items-center gap-3">
                          <ClipboardList className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-black">
                            Browse issues
                          </span>
                        </span>

                        <span className="text-[10px] font-black bg-white border border-slate-200 px-2 py-1 rounded-lg">
                          {issues.length}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setFilterPriority(
                            "CRITICAL",
                          );
                          setActiveTab("issues");
                        }}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 hover:bg-red-100 transition"
                      >
                        <span className="flex items-center gap-3">
                          <Flame className="w-4 h-4" />
                          <span className="text-xs font-black">
                            Critical issues
                          </span>
                        </span>

                        <span className="text-[10px] font-black bg-white border border-red-100 px-2 py-1 rounded-lg">
                          {metrics.critical}
                        </span>
                      </button>

                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />

                          <span className="text-[10px] uppercase tracking-widest font-black text-emerald-700">
                            Backend connected
                          </span>
                        </div>

                        <p className="text-[10px] text-emerald-700/70 mt-2">
                          Spring Boot + JWT + MySQL
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* =================================================
                ISSUES TAB
            ================================================= */}

            {activeTab === "issues" && (
              <section className="space-y-5">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Issue repository
                      </h2>

                      <p className="text-xs text-slate-500 mt-1">
                        Search, filter and manage
                        campus reports.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setFilterStatus("ALL");
                          setFilterPriority("ALL");
                          setFilterCategory("ALL");
                        }}
                        className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                      >
                        Reset
                      </button>

                      <button
                        onClick={openCreateModal}
                        className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black"
                      >
                        + New Issue
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mt-5">
                    <div className="relative lg:col-span-6">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                      <input
                        value={searchTerm}
                        onChange={(event) =>
                          setSearchTerm(
                            event.target.value,
                          )
                        }
                        placeholder="Search by title, ID, location or category..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>

                    <select
                      value={filterStatus}
                      onChange={(event) =>
                        setFilterStatus(
                          event.target.value,
                        )
                      }
                      className="lg:col-span-2 px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold outline-none"
                    >
                      <option value="ALL">
                        All Status
                      </option>

                      {STATUSES.map((status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {getStatusLabel(status)}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filterPriority}
                      onChange={(event) =>
                        setFilterPriority(
                          event.target.value,
                        )
                      }
                      className="lg:col-span-2 px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold outline-none"
                    >
                      <option value="ALL">
                        All Priority
                      </option>

                      {PRIORITIES.map(
                        (priority) => (
                          <option
                            key={priority}
                            value={priority}
                          >
                            {priority}
                          </option>
                        ),
                      )}
                    </select>

                    <select
                      value={filterCategory}
                      onChange={(event) =>
                        setFilterCategory(
                          event.target.value,
                        )
                      }
                      className="lg:col-span-2 px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold outline-none"
                    >
                      <option value="ALL">
                        All Categories
                      </option>

                      {CATEGORIES.map(
                        (category) => (
                          <option
                            key={category}
                            value={category}
                          >
                            {category}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Filter className="w-3.5 h-3.5" />
                    Showing
                    <strong className="text-slate-900">
                      {filteredIssues.length}
                    </strong>
                    issues
                  </div>

                  <span className="hidden sm:block font-mono text-[10px] text-slate-400">
                    GET /api/issues/page
                  </span>
                </div>

                {loading ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                    <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin" />

                    <p className="text-sm font-bold text-slate-600 mt-4">
                      Loading issues...
                    </p>
                  </div>
                ) : filteredIssues.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-16 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                      <Search className="w-6 h-6" />
                    </div>

                    <h3 className="text-sm font-black text-slate-900 mt-4">
                      No issues match
                    </h3>

                    <p className="text-xs text-slate-500 mt-1">
                      Try changing your filters.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {filteredIssues.map(
                        (issue) => (
                          <article
                            key={issue.id}
                            onClick={() =>
                              setSelectedIssue(
                                issue,
                              )
                            }
                            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-blue-200 transition cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-[10px] font-black text-blue-600">
                                    #{issue.id}
                                  </span>

                                  <span
                                    className={`px-2 py-1 rounded-full border text-[9px] font-black ${getPriorityClass(
                                      issue.priority,
                                    )}`}
                                  >
                                    {issue.priority}
                                  </span>

                                  <span
                                    className={`px-2 py-1 rounded-full border text-[9px] font-black ${getStatusClass(
                                      issue.status,
                                    )}`}
                                  >
                                    {getStatusLabel(
                                      issue.status,
                                    )}
                                  </span>
                                </div>

                                <h3 className="text-sm sm:text-base font-black text-slate-900 mt-3 line-clamp-2">
                                  {issue.title}
                                </h3>
                              </div>

                              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0 mt-1" />
                            </div>

                            <p className="text-xs text-slate-500 leading-6 mt-3 line-clamp-2">
                              {issue.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 mt-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-600">
                                <MapPin className="w-3 h-3 text-rose-500" />
                                {issue.location}
                              </span>

                              <span className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-600">
                                {issue.category}
                              </span>
                            </div>

                            <div
                              className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100"
                              onClick={(event) =>
                                event.stopPropagation()
                              }
                            >
                              <span className="text-[10px] text-slate-400">
                                {formatDate(
                                  issue.createdAt,
                                )}
                              </span>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    openEditModal(
                                      issue,
                                    )
                                  }
                                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-black hover:bg-blue-100"
                                >
                                  Edit
                                </button>

                                {isAdminRole(role) && (
                                  <button
                                    onClick={() =>
                                      deleteIssue(
                                        issue.id,
                                      )
                                    }
                                    className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </article>
                        ),
                      )}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-4 pt-2">
                        <button
                          disabled={page === 0}
                          onClick={() =>
                            loadIssues(page - 1)
                          }
                          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold disabled:opacity-40"
                        >
                          ← Previous
                        </button>

                        <span className="text-xs text-slate-500 font-bold">
                          Page{" "}
                          <strong className="text-slate-900">
                            {page + 1}
                          </strong>{" "}
                          of{" "}
                          <strong className="text-slate-900">
                            {totalPages}
                          </strong>
                        </span>

                        <button
                          disabled={
                            page >=
                            totalPages - 1
                          }
                          onClick={() =>
                            loadIssues(page + 1)
                          }
                          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold disabled:opacity-40"
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </section>
            )}

            {/* =================================================
                ANALYTICS
            ================================================= */}

            {activeTab === "analytics" && (
              <section className="space-y-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-600">
                    Operational Insights
                  </p>

                  <h2 className="text-2xl font-black text-slate-900 mt-1">
                    Campus Analytics
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Quick insights calculated from your
                    live issue records.
                  </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    ["Total", metrics.total],
                    ["Open", metrics.open],
                    [
                      "In Progress",
                      metrics.inProgress,
                    ],
                    ["Resolved", metrics.resolved],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
                    >
                      <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                        {label}
                      </p>

                      <p className="text-3xl font-black text-slate-900 mt-2">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-black text-slate-900">
                          Issues by category
                        </h3>

                        <p className="text-[11px] text-slate-500 mt-1">
                          Distribution of loaded issues.
                        </p>
                      </div>

                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>

                    <div className="mt-6 space-y-4">
                      {categoryStats.length === 0 ? (
                        <p className="text-xs text-slate-500">
                          No category data available.
                        </p>
                      ) : (
                        categoryStats.map(
                          ([category, count]) => {
                            const percent =
                              metrics.total > 0
                                ? Math.round(
                                    (count /
                                      metrics.total) *
                                      100,
                                  )
                                : 0;

                            return (
                              <div key={category}>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-700">
                                    {category}
                                  </span>

                                  <span className="text-xs font-black text-slate-900">
                                    {count}
                                  </span>
                                </div>

                                <div className="h-2 mt-2 rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-blue-600 transition-all"
                                    style={{
                                      width: `${percent}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          },
                        )
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-black text-slate-900">
                          Priority overview
                        </h3>

                        <p className="text-[11px] text-slate-500 mt-1">
                          Current operational priority mix.
                        </p>
                      </div>

                      <Flame className="w-5 h-5 text-orange-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      {[
                        [
                          "Critical",
                          metrics.critical,
                          "text-red-600",
                          "bg-red-50",
                        ],
                        [
                          "High",
                          metrics.high,
                          "text-orange-600",
                          "bg-orange-50",
                        ],
                        [
                          "Open",
                          metrics.open,
                          "text-amber-600",
                          "bg-amber-50",
                        ],
                        [
                          "Resolved",
                          metrics.resolved,
                          "text-emerald-600",
                          "bg-emerald-50",
                        ],
                      ].map(
                        ([
                          label,
                          value,
                          color,
                          bg,
                        ]) => (
                          <div
                            key={label}
                            className={`p-4 rounded-xl ${bg} border border-slate-100`}
                          >
                            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                              {label}
                            </p>

                            <p
                              className={`text-2xl font-black mt-2 ${color}`}
                            >
                              {value}
                            </p>
                          </div>
                        ),
                      )}
                    </div>

                    <div className="mt-5 p-4 rounded-xl bg-blue-50 border border-blue-100">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />

                        <span className="text-xs font-black text-blue-900">
                          Security status
                        </span>
                      </div>

                      <p className="text-xs text-blue-800/70 leading-5 mt-2">
                        Current requests are sent using
                        the authenticated JWT session.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>

      {/* =====================================================
          ISSUE DETAIL MODAL
      ===================================================== */}

      {selectedIssue && (
        <div className="fixed inset-0 z-[70] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] font-black text-blue-600">
                    #{selectedIssue.id}
                  </span>

                  <span
                    className={`px-2 py-1 rounded-full border text-[9px] font-black ${getPriorityClass(
                      selectedIssue.priority,
                    )}`}
                  >
                    {selectedIssue.priority}
                  </span>

                  <span
                    className={`px-2 py-1 rounded-full border text-[9px] font-black ${getStatusClass(
                      selectedIssue.status,
                    )}`}
                  >
                    {getStatusLabel(
                      selectedIssue.status,
                    )}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-3">
                  {selectedIssue.title}
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedIssue(null)
                }
                className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                    Location
                  </p>

                  <p className="text-sm font-black text-slate-800 mt-2">
                    {selectedIssue.location}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                    Category
                  </p>

                  <p className="text-sm font-black text-slate-800 mt-2">
                    {selectedIssue.category}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                    Reported By
                  </p>

                  <p className="text-sm font-black text-slate-800 mt-2">
                    {selectedIssue.createdBy}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                    Reported On
                  </p>

                  <p className="text-sm font-black text-slate-800 mt-2">
                    {formatDate(
                      selectedIssue.createdAt,
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                  Description
                </p>

                <div className="mt-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-slate-600 leading-7">
                  {selectedIssue.description ||
                    "No description provided."}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2">
                  Update Status
                </p>

                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        updateStatus(
                          selectedIssue.id,
                          status,
                        )
                      }
                      className={`px-3 py-2 rounded-xl border text-xs font-black transition ${
                        selectedIssue.status ===
                        status
                          ? getStatusClass(status)
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {getStatusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between">
              <div>
                {isAdminRole(role) && (
                  <button
                    onClick={() =>
                      deleteIssue(
                        selectedIssue.id,
                      )
                    }
                    className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 text-red-700 border border-red-100 text-xs font-black hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    openEditModal(
                      selectedIssue,
                    )
                  }
                  className="px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-black hover:bg-blue-100"
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    setSelectedIssue(null)
                  }
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          REPORT / EDIT MODAL
      ===================================================== */}

      {reportModalOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-blue-200 font-black">
                  Campus Operations
                </p>

                <h2 className="text-xl font-black mt-1">
                  {editingId
                    ? "Edit Issue"
                    : "Report an Issue"}
                </h2>
              </div>

              <button
                onClick={() => {
                  setReportModalOpen(false);
                  resetForm();
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleIssueSubmit}
              className="p-5 sm:p-6 space-y-5"
            >
              <div>
                <label className="block text-xs font-black text-slate-700 mb-2">
                  Issue Title
                </label>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleFormInput}
                  placeholder="e.g. Projector not working in Lab 204"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-2">
                    Category
                  </label>

                  <div className="relative">
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleFormInput}
                      className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-blue-500"
                    >
                      {CATEGORIES.map(
                        (category) => (
                          <option
                            key={category}
                            value={category}
                          >
                            {category}
                          </option>
                        ),
                      )}
                    </select>

                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-2">
                    Priority
                  </label>

                  <div className="relative">
                    <select
                      name="priority"
                      value={form.priority}
                      onChange={handleFormInput}
                      className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-blue-500"
                    >
                      {PRIORITIES.map(
                        (priority) => (
                          <option
                            key={priority}
                            value={priority}
                          >
                            {priority}
                          </option>
                        ),
                      )}
                    </select>

                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-2">
                  Location
                </label>

                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <input
                    name="location"
                    value={form.location}
                    onChange={handleFormInput}
                    placeholder="e.g. Block C, Room 204"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormInput}
                  rows={5}
                  placeholder="Describe the issue clearly..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none resize-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  required
                />
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-blue-600 mt-0.5" />

                <p className="text-xs text-blue-800/80 leading-5">
                  Give a specific location and clear
                  description so the issue can be
                  resolved faster.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setReportModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  disabled={savingIssue}
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black disabled:opacity-60"
                >
                  {savingIssue
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Submit Issue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-sm">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-950 text-white shadow-2xl">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>

            <span className="text-xs font-bold">
              {toast}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}