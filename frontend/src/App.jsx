import React, { useState, useMemo, useEffect } from 'react';
const API_URL = "http://localhost:8080";
import {
  Building2,
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  LogOut,
  Search,
  ChevronDown,
  CheckCircle2,
  Clock,
  Wrench,
  AlertTriangle,
  ThumbsUp,
  MapPin,
  X,
  Compass,
  Zap,
  ArrowRight,
  ShieldCheck,
  Menu,
  RotateCw,
  Check,
  User,
  Star,
  MessageSquare,
  Send,
  Sparkles,
  Lock,
  Filter,
  Eye
} 

from 'lucide-react';

const INITIAL_ISSUES = [
  {
    id: "CC-1082",
    title: "Projector flickering & HDMI port damaged in Seminar Hall 1",
    category: "Classroom / AV",
    priority: "HIGH",
    status: "IN_PROGRESS",
    building: "Aryabhata Academic Block",
    floor: "2nd Floor, Hall 1",
    description: "Overhead projector loses color balance and flickers green every 5 minutes. Wall HDMI faceplate is cracked and pins are bent.",
    reportedBy: "Ayush Sharma",
    userRoleBadge: "B.Tech CSE '26",
    reportedDate: "20m ago",
    assignedTo: "Rajesh Kumar",
    assignedRole: "Senior AV Specialist",
    slaDeadline: "Today, 5:30 PM",
    upvotes: 19,
    hasUpvoted: false,
    comments: [
      { author: "Prof. Sengupta", role: "Faculty", time: "15m ago", text: "Verified during morning lecture. Please expedite." },
      { author: "Rajesh Kumar", role: "AV Tech", time: "5m ago", text: "Dispatched spare 4K HDMI repeater." }
    ],
    history: [
      { status: "OPEN", timestamp: "09:30 AM", note: "Reported via mobile portal." },
      { status: "IN_PROGRESS", timestamp: "10:15 AM", note: "Assigned to Campus AV Engineering Pool." }
    ]
  },
  {
    id: "CC-1081",
    title: "Air conditioning chilled water leak above server racks in Lab 304",
    category: "Labs & Computers",
    priority: "CRITICAL",
    status: "OPEN",
    building: "Turing Computing Block",
    floor: "3rd Floor, Lab 304",
    description: "Chilled water conduit condensation is steadily dripping onto Dell PowerEdge workstation row 3. High electrical trip risk.",
    reportedBy: "Pooja Hegde",
    userRoleBadge: "Lab Assistant",
    reportedDate: "35m ago",
    assignedTo: "Unassigned",
    assignedRole: "HVAC Emergency Unit",
    slaDeadline: "Within 45 mins",
    upvotes: 34,
    hasUpvoted: true,
    comments: [
      { author: "Pooja Hegde", role: "Lab Assistant", time: "30m ago", text: "Switched off breaker strip 4." }
    ],
    history: [
      { status: "OPEN", timestamp: "11:10 AM", note: "Emergency alert triggered." }
    ]
  },
  {
    id: "CC-1079",
    title: "Central Library 3rd Floor Wi-Fi access point unreachable",
    category: "Network / Wi-Fi",
    priority: "MEDIUM",
    status: "RESOLVED",
    building: "Central Library",
    floor: "3rd Floor, North Study Wing",
    description: "SSID 'CampusConnect-5G' dropping packets continuously. Latency spikes above 900ms.",
    reportedBy: "Karan Patel",
    userRoleBadge: "B.Tech IT '25",
    reportedDate: "Yesterday",
    assignedTo: "Naveen Rao",
    assignedRole: "NOC Infrastructure",
    slaDeadline: "Met (resolved in 2.5h)",
    upvotes: 42,
    hasUpvoted: false,
    comments: [
      { author: "Naveen Rao", role: "NOC", time: "Yesterday", text: "Rebooted PoE switch port 18." }
    ],
    history: [
      { status: "OPEN", timestamp: "Yesterday, 03:45 PM", note: "Logged by student." },
      { status: "RESOLVED", timestamp: "Yesterday, 06:15 PM", note: "Access point restored." }
    ]
  },
  {
    id: "CC-1075",
    title: "Water purification dispenser cooling failure near Mess Entry",
    category: "Sanitation & Water",
    priority: "LOW",
    status: "IN_PROGRESS",
    building: "Boys Hostel 3 (BH-3)",
    floor: "Ground Floor Mess Entry",
    description: "RO filtration compressor is running constantly without chilling water. Filter replacement indicator LED blinking.",
    reportedBy: "Devendra Verma",
    userRoleBadge: "Hostel Prefect",
    reportedDate: "2 days ago",
    assignedTo: "Surender P.",
    assignedRole: "Hostel Estate Care",
    slaDeadline: "Tomorrow, 12:00 PM",
    upvotes: 12,
    hasUpvoted: false,
    comments: [],
    history: [
      { status: "OPEN", timestamp: "2 days ago", note: "Created via portal." }
    ]
  },
  {
    id: "CC-1072",
    title: "High-mast perimeter floodlight dark near Mechanical Workshop",
    category: "Electrical & Safety",
    priority: "HIGH",
    status: "RESOLVED",
    building: "Mechanical Workshop",
    floor: "Outer Walkway Pole #04",
    description: "Walkway between Mech Workshop and CAD Lab is pitch dark after 6:30 PM. Safety hazard for students.",
    reportedBy: "Megha Sunder",
    userRoleBadge: "B.Tech ME '25",
    reportedDate: "3 days ago",
    assignedTo: "Electrical Works Unit",
    assignedRole: "Power Distribution",
    slaDeadline: "Met",
    upvotes: 27,
    hasUpvoted: true,
    comments: [],
    history: [
      { status: "OPEN", timestamp: "3 days ago", note: "Reported." },
      { status: "RESOLVED", timestamp: "2 days ago", note: "Driver unit replaced." }
    ]
  },
  {
    id: "CC-1070",
    title: "Classroom 102 Smart Board touch digitizer calibration error",
    category: "Classroom / AV",
    priority: "LOW",
    status: "OPEN",
    building: "Aryabhata Academic Block",
    floor: "1st Floor, Room 102",
    description: "Stylus offset by approximately 4 inches to the right. Makes drawing diagrams impossible.",
    reportedBy: "Sanya Roy",
    userRoleBadge: "B.Tech ECE '26",
    reportedDate: "4 days ago",
    assignedTo: "Rajesh Kumar",
    assignedRole: "AV Support",
    slaDeadline: "Pending schedule",
    upvotes: 8,
    hasUpvoted: false,
    comments: [],
    history: [{ status: "OPEN", timestamp: "4 days ago", note: "Created." }]
  },
  {
    id: "CC-1068",
    title: "Server Rack UPS battery fault alarm in Network Operations Center",
    category: "Labs & Computers",
    priority: "CRITICAL",
    status: "IN_PROGRESS",
    building: "Turing Computing Block",
    floor: "Basement NOC",
    description: "UPS Bank B beeping with Error code #08 (Battery cell degraded). Main generator fallback verified.",
    reportedBy: "Naveen Rao",
    userRoleBadge: "NOC Infrastructure",
    reportedDate: "5 days ago",
    assignedTo: "Vendor Support",
    assignedRole: "APC Field Tech",
    slaDeadline: "Today, 6:00 PM",
    upvotes: 45,
    hasUpvoted: true,
    comments: [],
    history: [{ status: "OPEN", timestamp: "5 days ago", note: "Created." }, { status: "IN_PROGRESS", timestamp: "4 days ago", note: "Vendor contacted." }]
  }
];

const CATEGORIES = [
  "All Categories",
  "Classroom / AV",
  "Labs & Computers",
  "Network / Wi-Fi",
  "Sanitation & Water",
  "Electrical & Safety"
];

const FEEDBACK_CATEGORIES = [
  "All Categories",
  "Maintenance & Turnaround",
  "Labs & IT Infrastructure",
  "Hostel & Mess Sanitation",
  "Campus Safety & Lighting",
  "Portal Usability"
];

const INITIAL_FEEDBACK = [
  {
    id: "FB-201",
    author: "Ayush Sharma",
    userRoleBadge: "B.Tech CSE '26",
    category: "Labs & IT Infrastructure",
    rating: 5,
    date: "1 hour ago",
    ticketRef: "CC-1079 (Central Library Wi-Fi)",
    comment: "The Wi-Fi access point in the 3rd floor study wing was restored within 2 hours of posting. Exceptionally prompt response by the NOC engineering team!",
    helpfulCount: 14,
    hasLiked: false,
    status: "Acknowledged by Estate Office",
    anonymous: false
  },
  {
    id: "FB-202",
    author: "Anonymous Student",
    userRoleBadge: "Hostel Resident",
    category: "Hostel & Mess Sanitation",
    rating: 3,
    date: "Yesterday",
    ticketRef: "CC-1075 (Hostel Water Dispenser)",
    comment: "The water cooler was checked, but the cooling unit turns off during peak afternoon heat. Please consider replacing the compressor unit before summer exams.",
    helpfulCount: 9,
    hasLiked: false,
    status: "Under Review",
    anonymous: true
  },
  {
    id: "FB-203",
    author: "Megha Sunder",
    userRoleBadge: "B.Tech ME '25",
    category: "Campus Safety & Lighting",
    rating: 5,
    date: "3 days ago",
    ticketRef: "CC-1072 (Perimeter Floodlight)",
    comment: "The high-mast pole between the Mech Workshop and CAD Lab is now fully lit. Night walkway feels drastically safer for students returning from late lab sessions.",
    helpfulCount: 22,
    hasLiked: true,
    status: "Resolved & Verified",
    anonymous: false
  },
  {
    id: "FB-204",
    author: "Rohan Varma",
    userRoleBadge: "B.Tech ECE '27",
    category: "Portal Usability",
    rating: 4,
    date: "5 days ago",
    ticketRef: "General Experience",
    comment: "The CampusConnect tracking dashboard saves so much time compared to queuing at the administrative warden office. The live status updates are super reassuring.",
    helpfulCount: 12,
    hasLiked: false,
    status: "Acknowledged by Admin",
    anonymous: false
  }
];

const STATUS_CONFIG = {
  OPEN: {
    label: "Open",
    badge: "bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-200",
    dot: "bg-amber-500",
    accent: "text-amber-600"
  },
  IN_PROGRESS: {
    label: "In Progress",
    badge: "bg-sky-50 text-sky-700 border-sky-300 ring-1 ring-sky-200",
    dot: "bg-sky-500",
    accent: "text-sky-600"
  },
  RESOLVED: {
    label: "Resolved",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200",
    dot: "bg-emerald-500",
    accent: "text-emerald-600"
  },
  CLOSED: {
    label: "Closed",
    badge: "bg-slate-100 text-slate-700 border-slate-300 ring-1 ring-slate-200",
    dot: "bg-slate-400",
    accent: "text-slate-500"
  }
};

const PRIORITY_CONFIG = {
  LOW: { badge: "bg-slate-100 text-slate-700 border-slate-200", indicator: "bg-slate-400" },
  MEDIUM: { badge: "bg-blue-50 text-blue-700 border-blue-200", indicator: "bg-blue-500" },
  HIGH: { badge: "bg-amber-50 text-amber-800 border-amber-300", indicator: "bg-amber-500" },
  CRITICAL: { badge: "bg-rose-50 text-rose-700 border-rose-300 font-bold", indicator: "bg-rose-600" }
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [currentUser, setCurrentUser] = useState({
    username: "ayush",
    displayName: "Ayush Sharma",
    roleBadge: "B.Tech CSE '26"
  });

  const [loginForm, setLoginForm] = useState({
    username: "ayush",
    password: "••••••••",
    role: "STUDENT"
  });

  const [authMode, setAuthMode] = useState("LOGIN"); // "LOGIN" | "REGISTER"
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    username: "",
    email: "",
    department: "Computer Science & Engineering",
    role: "STUDENT",
    password: ""
  });

  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" | "issues" | "map" | "feedback"
  const [currentUserRole, setCurrentUserRole] = useState("STUDENT"); // "STUDENT" | "ADMIN"
  const [issues, setIssues] = useState(INITIAL_ISSUES);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Feedback States
  const [feedbacks, setFeedbacks] = useState(INITIAL_FEEDBACK);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackRatingFilter, setFeedbackRatingFilter] = useState("ALL");
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState("All Categories");

  // Feedback Submission Form State
  const [newFeedbackRating, setNewFeedbackRating] = useState(5);
  const [newFeedbackCategory, setNewFeedbackCategory] = useState("Maintenance & Turnaround");
  const [newFeedbackComment, setNewFeedbackComment] = useState("");
  const [newFeedbackTicketRef, setNewFeedbackTicketRef] = useState("General Experience");
  const [newFeedbackIsAnonymous, setNewFeedbackIsAnonymous] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("All Categories");

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Memoized KPI metrics
  const metrics = useMemo(() => {
    const total = issues.length;
    const open = issues.filter(i => i.status === "OPEN").length;
    const work = issues.filter(i => i.status === "IN_PROGRESS").length;
    const done = issues.filter(i => i.status === "RESOLVED" || i.status === "CLOSED").length;
    return { total, open, work, done };
  }, [issues]);

  // Filtered Issues list
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSearch =
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.floor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === "ALL" || issue.status === filterStatus;
      const matchesPriority = filterPriority === "ALL" || issue.priority === filterPriority;
      const matchesCategory = filterCategory === "All Categories" || issue.category === filterCategory;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [issues, searchTerm, filterStatus, filterPriority, filterCategory]);

  // Memoized feedback metrics
  const feedbackStats = useMemo(() => {
    const total = feedbacks.length;
    if (total === 0) return { avg: "0.0", total: 0, satisfactionRate: 0, fiveStar: 0 };
    const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    const avg = (sum / total).toFixed(1);
    const satisfied = feedbacks.filter(f => f.rating >= 4).length;
    const satisfactionRate = Math.round((satisfied / total) * 100);
    const fiveStar = feedbacks.filter(f => f.rating === 5).length;
    return { avg, total, satisfactionRate, fiveStar };
  }, [feedbacks]);

  // Filtered feedback list
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((item) => {
      const matchesRating =
        feedbackRatingFilter === "ALL" ||
        (feedbackRatingFilter === "LEQ3" ? item.rating <= 3 : item.rating === Number(feedbackRatingFilter));

      const matchesCategory =
        feedbackCategoryFilter === "All Categories" || item.category === feedbackCategoryFilter;

      return matchesRating && matchesCategory;
    });
  }, [feedbacks, feedbackRatingFilter, feedbackCategoryFilter]);

  const handleToggleUpvote = (id, e) => {
    e?.stopPropagation();
    setIssues((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextUpvoted = !item.hasUpvoted;
          return {
            ...item,
            hasUpvoted: nextUpvoted,
            upvotes: nextUpvoted ? item.upvotes + 1 : item.upvotes - 1
          };
        }
        return item;
      })
    );
    if (selectedIssue && selectedIssue.id === id) {
      setSelectedIssue((prev) => {
        const nextUpvoted = !prev.hasUpvoted;
        return {
          ...prev,
          hasUpvoted: nextUpvoted,
          upvotes: nextUpvoted ? prev.upvotes + 1 : prev.upvotes - 1
        };
      });
    }
    showToast("Vote preference saved");
  };

  const handleStatusChange = (id, newStatus) => {
    setIssues((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: newStatus,
              history: [
                ...item.history,
                { status: newStatus, timestamp: "Just now", note: `Status updated to ${newStatus} by admin.` }
              ]
            }
          : item
      )
    );
    if (selectedIssue && selectedIssue.id === id) {
      setSelectedIssue((prev) => ({
        ...prev,
        status: newStatus,
        history: [
          ...prev.history,
          { status: newStatus, timestamp: "Just now", note: `Status updated to ${newStatus} by admin.` }
        ]
      }));
    }
    showToast(`Ticket ${id} status moved to ${STATUS_CONFIG[newStatus].label}`);
  };

  const handleToggleFeedbackLike = (id) => {
    setFeedbacks((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextLiked = !item.hasLiked;
          return {
            ...item,
            hasLiked: nextLiked,
            helpfulCount: nextLiked ? item.helpfulCount + 1 : item.helpfulCount - 1
          };
        }
        return item;
      })
    );
    showToast("Feedback marked as helpful");
  };

  const handleAdminAcknowledgeFeedback = (id) => {
    setFeedbacks((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Acknowledged by Estate Office" } : item
      )
    );
    showToast("Feedback acknowledged by Administration");
  };

  const handleCreateFeedback = (e) => {
    e.preventDefault();
    if (!newFeedbackComment.trim()) {
      showToast("Please write a comment before submitting.");
      return;
    }
    const createdFeedback = {
      id: `FB-${Math.floor(210 + Math.random() * 800)}`,
      author: newFeedbackIsAnonymous ? "Anonymous Student" : currentUser.displayName || currentUser.username,
      userRoleBadge: newFeedbackIsAnonymous ? "Hostel Resident" : currentUser.roleBadge || "Student",
      category: newFeedbackCategory,
      rating: Number(newFeedbackRating),
      date: "Just now",
      ticketRef: newFeedbackTicketRef,
      comment: newFeedbackComment,
      helpfulCount: 0,
      hasLiked: false,
      status: "Under Review",
      anonymous: newFeedbackIsAnonymous
    };
    setFeedbacks([createdFeedback, ...feedbacks]);
    setIsFeedbackModalOpen(false);
    setNewFeedbackComment("");
    setNewFeedbackRating(5);
    showToast("Thank you! Your feedback has been posted successfully.");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSidebarOpen(false);
    showToast("Signed out successfully. Redirected to login page.");
  };

  const handleLoginSubmit = (e) => {
    e?.preventDefault();
    const role = loginForm.role;
    setCurrentUserRole(role);
    if (role === "ADMIN") {
      setCurrentUser({
        username: loginForm.username || "admin_estate",
        displayName: "Dr. K. S. Verma",
        roleBadge: "Chief Estate Officer"
      });
    } else {
      setCurrentUser({
        username: loginForm.username || "ayush",
        displayName: "Ayush Sharma",
        roleBadge: "B.Tech CSE '26"
      });
    }
    setIsLoggedIn(true);
    showToast(`Welcome back! Authenticated as ${role}`);
  };

  const handleRegisterSubmit = (e) => {
    e?.preventDefault();
    if (!registerForm.fullName || !registerForm.username || !registerForm.password) {
      showToast("Please fill in all required registration fields.");
      return;
    }
    const role = registerForm.role;
    setCurrentUserRole(role);
    setCurrentUser({
      username: registerForm.username,
      displayName: registerForm.fullName,
      roleBadge: role === "ADMIN" ? "Estate Administrator" : `${registerForm.department} Student`
    });
    setIsLoggedIn(true);
    showToast(`Account successfully registered for ${registerForm.fullName}!`);
  };

  const handleQuickDemoLogin = (role) => {
    setCurrentUserRole(role);
    if (role === "ADMIN") {
      setCurrentUser({
        username: "admin_estate",
        displayName: "Campus Admin (Estate)",
        roleBadge: "ROLE_ADMIN"
      });
      setLoginForm({ username: "admin_estate", password: "password123", role: "ADMIN" });
    } else {
      setCurrentUser({
        username: "ayush",
        displayName: "Ayush Sharma",
        roleBadge: "B.Tech CSE '26"
      });
      setLoginForm({ username: "ayush", password: "password123", role: "STUDENT" });
    }
    setIsLoggedIn(true);
    showToast(`Signed in as ${role === 'ADMIN' ? 'Facility Admin' : 'Ayush Sharma (Student)'}`);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 p-4 justify-between select-none">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-black text-lg text-white leading-tight">
                Campus<span className="text-blue-400">Connect</span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-300/80 font-bold block">
                SMART CAMPUS OS
              </span>
            </div>
          </div>
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2">
            WORKSPACE
          </span>

          <button
            onClick={() => {
              setActiveTab("dashboard");
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === "dashboard"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("issues");
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === "issues"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <div className="flex items-center space-x-3">
              <ClipboardList className="w-4 h-4" />
              <span>Campus Incidents</span>
            </div>
            <span className="text-[10px] bg-slate-800 text-blue-300 px-2 py-0.5 rounded-full font-mono">
              {issues.length}
            </span>
          </button>

          <button
            onClick={() => {
              setIsReportModalOpen(true);
              setSidebarOpen(false);
            }}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-400 hover:bg-emerald-950/40 border border-emerald-500/20 hover:border-emerald-500/40 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Problem</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("map");
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === "map"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Spatial Map</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("feedback");
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === "feedback"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <div className="flex items-center space-x-3">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Service Feedback</span>
            </div>
            <span className="text-[10px] bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded-full font-mono">
              {feedbacks.length}
            </span>
          </button>
        </div>

        {/* Role Toggle Switch */}
        <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between text-[10px] uppercase font-mono font-bold text-slate-400">
            <span>Privilege Mode</span>
            <span className={currentUserRole === "ADMIN" ? "text-purple-400" : "text-blue-400"}>
              {currentUserRole === "ADMIN" ? "ADMIN" : "STUDENT"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setCurrentUserRole("STUDENT")}
              className={`py-1.5 rounded-lg text-xs font-bold transition ${
                currentUserRole === "STUDENT"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-900/70 text-slate-400 hover:text-white"
              }`}
            >
              Student
            </button>
            <button
              onClick={() => setCurrentUserRole("ADMIN")}
              className={`py-1.5 rounded-lg text-xs font-bold transition ${
                currentUserRole === "ADMIN"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-slate-900/70 text-slate-400 hover:text-white"
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
            {currentUser.username.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{currentUser.displayName}</p>
            <p className="text-[10px] text-slate-400 truncate">{currentUser.roleBadge}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-3 sm:p-6 lg:p-10 font-sans text-slate-800 antialiased relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 flex items-center space-x-3 bg-white border border-slate-200 text-slate-900 px-4 py-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-3">
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}

        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-800/20 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10 animate-in zoom-in-95 duration-200">
          {/* Left Column: Branding */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 flex flex-col justify-between text-white relative overflow-hidden">
            <div className="space-y-6 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center font-black text-xl tracking-tight text-white">
                    Campus<span className="text-blue-400">Connect</span>
                  </div>
                  <span className="text-[10px] text-blue-300/80 font-mono tracking-wider font-semibold uppercase">
                    SMART CAMPUS PLATFORM
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="inline-flex items-center space-x-1.5 bg-blue-500/10 border border-blue-400/20 px-2.5 py-1 rounded-full text-[11px] font-semibold text-blue-300">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Centralized Infrastructure OS</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white leading-snug">
                  Fast, accountable, and transparent campus reporting.
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Bridge the gap between students and administration with real-time issue dispatch, automated SLAs, and verifiable resolution tracking.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Live Resolution</span>
                  <div className="text-xl font-mono font-black text-emerald-400 mt-0.5">94.8%</div>
                  <span className="text-[10px] text-slate-400">Within 24h SLA</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Total Solved</span>
                  <div className="text-xl font-mono font-black text-blue-400 mt-0.5">1,240+</div>
                  <span className="text-[10px] text-slate-400">Campus incidents</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                {[
                  "Spring Boot REST Backend with Stateless JWT",
                  "Role-based privilege routing (Student vs Estate Admin)",
                  "Instant facility notifications & live GPS location tags"
                ].map((feat, i) => (
                  <div key={i} className="flex items-center space-x-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Enterprise Grade Security</span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">v2.4.0</span>
            </div>
          </div>

          {/* Right Column: Forms */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div className="flex bg-slate-100 p-1 rounded-xl w-full max-w-xs border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setAuthMode("LOGIN")}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                      authMode === "LOGIN"
                        ? "bg-white text-blue-700 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode("REGISTER")}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                      authMode === "REGISTER"
                        ? "bg-white text-blue-700 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                  {authMode === "LOGIN" ? "Returning User" : "New Registration"}
                </span>
              </div>

              <div className="my-5">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {authMode === "LOGIN" ? "Welcome back to CampusConnect" : "Register your University ID"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {authMode === "LOGIN"
                    ? "Enter your credentials or use the 1-click demo logins below."
                    : "Create an account to report issues, track facilities, and vote on tickets."}
                </p>
              </div>

              {authMode === "LOGIN" ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      University ID / Username
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={loginForm.username}
                        onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                        placeholder="e.g. ayush or admin_estate"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => showToast("Password reset link sent to email")}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Access Role
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setLoginForm({ ...loginForm, role: "STUDENT", username: "ayush" })}
                        className={`py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center space-x-1.5 ${
                          loginForm.role === "STUDENT"
                            ? "bg-blue-50 border-blue-500 text-blue-700 shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <span>🎓 Student (User)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoginForm({ ...loginForm, role: "ADMIN", username: "admin_estate" })}
                        className={`py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center space-x-1.5 ${
                          loginForm.role === "ADMIN"
                            ? "bg-purple-50 border-purple-500 text-purple-700 shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <span>🛡️ Facility Admin</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 transition active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Sign In to CampusConnect</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={registerForm.fullName}
                        onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                        placeholder="e.g. Ayush Sharma"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        University Username *
                      </label>
                      <input
                        type="text"
                        required
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                        placeholder="e.g. ayush_26"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Campus Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        placeholder="student@univ.edu.in"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Department / Branch
                      </label>
                      <select
                        value={registerForm.department}
                        onChange={(e) => setRegisterForm({ ...registerForm, department: e.target.value })}
                        className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 cursor-pointer"
                      >
                        <option value="Computer Science & Engineering">Computer Science & Eng</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electronics & Comm">Electronics & Comm</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Estate Administration">Estate Administration</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Choose Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        placeholder="Min 6 characters"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Account Role
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setRegisterForm({ ...registerForm, role: "STUDENT" })}
                          className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                            registerForm.role === "STUDENT"
                              ? "bg-blue-50 border-blue-500 text-blue-700"
                              : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                        >
                          Student
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegisterForm({ ...registerForm, role: "ADMIN" })}
                          className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                            registerForm.role === "ADMIN"
                              ? "bg-purple-50 border-purple-500 text-purple-700"
                              : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                        >
                          Admin
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Complete Registration & Launch Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Quick 1-Click Demo Logins */}
            <div className="pt-5 mt-5 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
                <span>Quick 1-Click Demo Logins</span>
                <span className="text-blue-600 font-semibold lowercase">Instant Test</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin("STUDENT")}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/60 text-left transition group cursor-pointer"
                >
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <p className="text-[11px] font-bold text-slate-800 group-hover:text-blue-600">Ayush Sharma</p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 pl-3.5">Student / B.Tech CSE</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin("ADMIN")}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-purple-400 bg-slate-50 hover:bg-purple-50/60 text-left transition group cursor-pointer"
                >
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <p className="text-[11px] font-bold text-slate-800 group-hover:text-purple-600">Estate Admin</p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 pl-3.5">Chief Authority (ROLE_ADMIN)</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-slate-50 text-slate-800 font-sans antialiased overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-3 bg-white border border-slate-200 text-slate-800 px-4 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-3">
          <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex lg:w-64 flex-col flex-shrink-0 sticky top-0 h-screen z-30 border-r border-slate-800 shadow-md">
        {renderSidebarContent()}
      </aside>

      {/* Mobile / Split-screen Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition focus:outline-none cursor-pointer"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-blue-600 block">
                OVERVIEW
              </span>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate flex items-center">
                Good day, {currentUser.username} <span className="ml-1.5">👋</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <button
              onClick={() => showToast("Incident stream refreshed")}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 sm:px-4 py-2 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">Report Issue</span>
              <span className="xs:hidden sm:hidden">Report</span>
            </button>

            <button
              onClick={handleLogout}
              title="Logout"
              className="w-8 h-8 rounded-xl bg-blue-100 hover:bg-rose-100 text-blue-700 hover:text-rose-700 font-bold text-xs flex items-center justify-center border border-blue-200 hover:border-rose-300 transition cursor-pointer"
            >
              {currentUserRole === "ADMIN" ? "AD" : "AY"}
            </button>
          </div>
        </header>

        {/* Content Tabs */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Operations Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-7 shadow-sm">
            <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl space-y-2">
              <div className="flex items-center space-x-1.5 text-blue-300 text-xs font-mono font-semibold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>CAMPUS OPERATIONS</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
                Keep your campus moving forward.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Report problems, monitor response progress and give campus teams the visibility they need to act quickly.
              </p>
              
              <div className="pt-2 flex flex-wrap gap-2.5">
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>Report a problem</span>
                </button>
                <button
                  onClick={() => setActiveTab("issues")}
                  className="px-4 py-2 bg-slate-800/80 hover:bg-slate-800 text-white border border-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>View all issues</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 4 Metric KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-2xs hover:border-blue-300 transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TOTAL ISSUES</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <ClipboardList className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-mono">{metrics.total}</p>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Current page data</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-2xs hover:border-amber-300 transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">OPEN</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-2 font-mono">{metrics.open}</p>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Needs attention</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-2xs hover:border-sky-300 transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">IN PROGRESS</span>
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200">
                  <Wrench className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-sky-600 mt-2 font-mono">{metrics.work}</p>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Active on-site</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-2xs hover:border-emerald-300 transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">RESOLVED</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2 font-mono">{metrics.done}</p>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Completed</p>
            </div>
          </div>

          {/* Search and Filters Bar */}
          {(activeTab === "dashboard" || activeTab === "issues") && (
            <div className="bg-white border border-slate-200 p-3.5 sm:p-4 rounded-2xl shadow-2xs space-y-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search issues by room, building, title or ticket ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-12 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-600 font-bold cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="relative flex-1 sm:flex-initial">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:border-blue-500 cursor-pointer text-xs"
                    >
                      <option value="ALL">Status: All</option>
                      <option value="OPEN">Status: Open</option>
                      <option value="IN_PROGRESS">Status: In Progress</option>
                      <option value="RESOLVED">Status: Resolved</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <div className="relative flex-1 sm:flex-initial">
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:border-blue-500 cursor-pointer text-xs"
                    >
                      <option value="ALL">Priority: All</option>
                      <option value="CRITICAL">Priority: Critical</option>
                      <option value="HIGH">Priority: High</option>
                      <option value="MEDIUM">Priority: Medium</option>
                      <option value="LOW">Priority: Low</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <div className="relative w-full sm:w-auto">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:border-blue-500 cursor-pointer text-xs"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {(searchTerm || filterStatus !== "ALL" || filterPriority !== "ALL" || filterCategory !== "All Categories") && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFilterStatus("ALL");
                        setFilterPriority("ALL");
                        setFilterCategory("All Categories");
                      }}
                      className="px-3 py-2 bg-amber-50 text-amber-700 border border-amber-300 rounded-xl text-xs font-bold hover:bg-amber-100 transition cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Incident Stream Cards */}
          {(activeTab === "dashboard" || activeTab === "issues") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>Showing <strong className="text-slate-900">{filteredIssues.length}</strong> incidents</span>
                <span className="font-mono text-blue-600 font-semibold">GET /api/issues</span>
              </div>

              {filteredIssues.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center text-slate-500 text-xs">
                  No campus incidents match the selected search or filter criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredIssues.map((issue) => (
                    <div
                      key={issue.id}
                      onClick={() => setSelectedIssue(issue)}
                      className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 p-4 sm:p-5 rounded-2xl cursor-pointer transition shadow-2xs flex flex-col justify-between space-y-3 group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="font-mono text-xs font-bold text-blue-600">{issue.id}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${PRIORITY_CONFIG[issue.priority].badge}`}>
                              {issue.priority}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[issue.status].badge}`}>
                              {STATUS_CONFIG[issue.status].label}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">{issue.reportedDate}</span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 mt-2.5 group-hover:text-blue-600 transition line-clamp-2">
                          {issue.title}
                        </h3>

                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {issue.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center space-x-1.5 text-slate-500 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                          <span className="truncate">{issue.building} ({issue.floor})</span>
                        </div>

                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={(e) => handleToggleUpvote(issue.id, e)}
                            className={`flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer ${
                              issue.hasUpvoted
                                ? "bg-purple-50 text-purple-700 border-purple-300"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:border-purple-300"
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5 text-purple-600" />
                            <span>{issue.upvotes}</span>
                          </button>

                          {currentUserRole === "ADMIN" && issue.status === "OPEN" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(issue.id, "IN_PROGRESS");
                              }}
                              className="px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-300 rounded-lg text-xs font-bold hover:bg-sky-600 hover:text-white transition cursor-pointer"
                            >
                              Assign
                            </button>
                          )}

                          {currentUserRole === "ADMIN" && issue.status === "IN_PROGRESS" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(issue.id, "RESOLVED");
                              }}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-bold hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Spatial Blueprint Tab */}
          {activeTab === "map" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center">
                  <Compass className="w-5 h-5 text-teal-600 mr-2" />
                  Campus Spatial Blueprint
                </h3>
                <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Telemetry Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {[
                  { name: "Aryabhata Academic Block", code: "Aryabhata", count: 4, status: "Active Incidents" },
                  { name: "Turing Computing Block", code: "Turing", count: 6, status: "High Priority" },
                  { name: "Central Library", code: "Library", count: 2, status: "Normal" },
                  { name: "Boys Hostel 3 (BH-3)", code: "Hostel", count: 5, status: "Maintenance Scheduled" },
                  { name: "Mechanical Workshop", code: "Workshop", count: 1, status: "Normal" }
                ].map((zone) => (
                  <div
                    key={zone.code}
                    onClick={() => {
                      setSearchTerm(zone.code);
                      setActiveTab("issues");
                    }}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 cursor-pointer transition hover:bg-white shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{zone.name}</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{zone.status}</p>
                    <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
                      <span className="text-slate-500">Issues:</span>
                      <span className="font-mono font-bold text-blue-600">{zone.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback & Satisfaction Tab */}
          {activeTab === "feedback" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-600 uppercase">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>SERVICE QUALITY & CAMPUS FEEDBACK</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                    Student & Faculty Experiences
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Transparent accountability for resolution times, facility quality, and maintenance staff.
                  </p>
                </div>

                <button
                  onClick={() => setIsFeedbackModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 flex-shrink-0 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Share Feedback</span>
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">AVERAGE RATING</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-2 mt-2">
                    <span className="text-3xl font-black text-slate-900 font-mono">{feedbackStats.avg}</span>
                    <span className="text-xs text-slate-400 font-medium">/ 5.0</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TOTAL REVIEWS</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-blue-600 mt-2 font-mono">{feedbackStats.total}</p>
                </div>

                <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SATISFACTION RATE</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-emerald-600 mt-2 font-mono">{feedbackStats.satisfactionRate}%</p>
                </div>

                <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">5-STAR RATINGS</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-purple-600 mt-2 font-mono">{feedbackStats.fiveStar}</p>
                </div>
              </div>

              {/* Feedbacks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFeedbacks.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 hover:border-amber-300 p-5 rounded-2xl shadow-2xs transition flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            item.anonymous ? 'bg-slate-200 text-slate-600' : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}>
                            {item.anonymous ? "?" : item.author.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <h4 className="text-xs font-bold text-slate-900">{item.author}</h4>
                              {item.anonymous && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                                  Anonymous
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">{item.userRoleBadge} • {item.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-0.5 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s <= item.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-3">
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-mono font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 truncate max-w-[220px]">
                          Ref: {item.ticketRef}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 mt-2.5 leading-relaxed">
                        "{item.comment}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-300">
                        {item.status}
                      </span>

                      <div className="flex items-center space-x-2">
                        {currentUserRole === "ADMIN" && !item.status.includes("Acknowledged") && (
                          <button
                            onClick={() => handleAdminAcknowledgeFeedback(item.id)}
                            className="text-[10px] px-2 py-1 bg-purple-50 text-purple-700 border border-purple-300 rounded-lg font-bold hover:bg-purple-100 transition cursor-pointer"
                          >
                            Acknowledge
                          </button>
                        )}

                        <button
                          onClick={() => handleToggleFeedbackLike(item.id)}
                          className={`flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer ${
                            item.hasLiked
                              ? "bg-amber-50 text-amber-800 border-amber-300"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:border-amber-300"
                          }`}
                        >
                          <ThumbsUp className={`w-3 h-3 ${item.hasLiked ? 'text-amber-600 fill-amber-600' : 'text-slate-400'}`} />
                          <span>Helpful ({item.helpfulCount})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-blue-600">{selectedIssue.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[selectedIssue.status].badge}`}>
                    {STATUS_CONFIG[selectedIssue.status].label}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${PRIORITY_CONFIG[selectedIssue.priority].badge}`}>
                    {selectedIssue.priority}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1.5">{selectedIssue.title}</h3>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-500 text-[11px]">Location:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedIssue.building}</p>
                  <p className="text-slate-600">{selectedIssue.floor}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Category:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedIssue.category}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Reported By:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedIssue.reportedBy}</p>
                  <span className="text-slate-500 text-[10px]">{selectedIssue.userRoleBadge}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Field Assignee:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedIssue.assignedTo}</p>
                  <span className="text-slate-500 text-[10px]">{selectedIssue.assignedRole}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Description</span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 mt-1 leading-relaxed">
                  {selectedIssue.description}
                </p>
              </div>

              {currentUserRole === "ADMIN" && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
                  <span className="font-bold text-purple-900 text-xs flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-1.5 text-purple-700" />
                    Admin Status Controls
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleStatusChange(selectedIssue.id, "OPEN")}
                      className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-300 font-bold hover:bg-amber-200 transition cursor-pointer"
                    >
                      Set Open
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedIssue.id, "IN_PROGRESS")}
                      className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 border border-sky-300 font-bold hover:bg-sky-200 transition cursor-pointer"
                    >
                      Set In Progress
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedIssue.id, "RESOLVED")}
                      className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold hover:bg-emerald-200 transition cursor-pointer"
                    >
                      Set Resolved
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={(e) => handleToggleUpvote(selectedIssue.id, e)}
                className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-xl border font-bold transition cursor-pointer ${
                  selectedIssue.hasUpvoted
                    ? "bg-purple-100 text-purple-800 border-purple-300"
                    : "bg-white text-slate-700 border-slate-200 hover:border-purple-300"
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5 text-purple-600" />
                <span>{selectedIssue.upvotes} Upvotes</span>
              </button>

              <button
                onClick={() => setSelectedIssue(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Report Campus Issue</h3>
                <p className="text-xs text-blue-100">POST /api/issues with validated payload</p>
              </div>
              <button onClick={() => setIsReportModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const newIssue = {
                  id: `CC-${Math.floor(1090 + Math.random() * 900)}`,
                  title: form.title.value,
                  category: form.category.value,
                  priority: form.priority.value,
                  status: "OPEN",
                  building: form.building.value,
                  floor: form.floor.value,
                  description: form.description.value,
                  reportedBy: currentUser.displayName || currentUser.username,
                  userRoleBadge: currentUser.roleBadge || "Student",
                  reportedDate: "Just now",
                  assignedTo: "Unassigned",
                  assignedRole: "Triage Pool",
                  slaDeadline: "Calculated",
                  upvotes: 1,
                  hasUpvoted: true,
                  comments: [],
                  history: [{ status: "OPEN", timestamp: "Just now", note: "Created via portal." }]
                };
                setIssues([newIssue, ...issues]);
                setIsReportModalOpen(false);
                showToast(`Incident #${newIssue.id} submitted!`);
              }}
              className="p-5 sm:p-6 space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-slate-600 font-bold uppercase text-[10px] mb-1">Issue Title *</label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Overhead projector flicker in Hall 1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 font-bold uppercase text-[10px] mb-1">Category</label>
                  <select
                    name="category"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {CATEGORIES.filter((c) => c !== "All Categories").map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold uppercase text-[10px] mb-1">Priority</label>
                  <select
                    name="priority"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 font-bold uppercase text-[10px] mb-1">Building Zone</label>
                  <select
                    name="building"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Aryabhata Academic Block">Aryabhata Block</option>
                    <option value="Turing Computing Block">Turing Block</option>
                    <option value="Central Library">Central Library</option>
                    <option value="Boys Hostel 3 (BH-3)">Hostels Complex</option>
                    <option value="Mechanical Workshop">Mechanical Workshop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold uppercase text-[10px] mb-1">Room / Floor *</label>
                  <input
                    name="floor"
                    required
                    placeholder="e.g. 2nd Floor, Hall 1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold uppercase text-[10px] mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Detail symptoms or lecture disruption..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 transition font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Submission Modal */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center space-x-1.5">
                  <Star className="w-4 h-4 fill-white" />
                  <span>Share Campus Feedback</span>
                </h3>
                <p className="text-xs text-amber-100">POST /api/feedbacks with satisfaction rating</p>
              </div>
              <button
                onClick={() => setIsFeedbackModalOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFeedback} className="p-5 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold uppercase text-[10px] mb-1.5">
                  Overall Rating *
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 p-2 rounded-xl">
                    {[1, 2, 3, 4, 5].map((starValue) => (
                      <button
                        type="button"
                        key={starValue}
                        onClick={() => setNewFeedbackRating(starValue)}
                        className="p-1 hover:scale-115 transition-transform focus:outline-none cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            starValue <= newFeedbackRating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-300 hover:text-amber-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200 font-mono">
                    {newFeedbackRating === 5 ? "⭐⭐⭐⭐⭐ Exceptional" :
                     newFeedbackRating === 4 ? "⭐⭐⭐⭐ Good" :
                     newFeedbackRating === 3 ? "⭐⭐⭐ Average" :
                     newFeedbackRating === 2 ? "⭐⭐ Below Average" : "⭐ Poor"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold uppercase text-[10px] mb-1">
                  Category / Facility *
                </label>
                <select
                  value={newFeedbackCategory}
                  onChange={(e) => setNewFeedbackCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer text-xs"
                >
                  {FEEDBACK_CATEGORIES.filter((c) => c !== "All Categories").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold uppercase text-[10px] mb-1">
                  Linked Incident / Service (Optional)
                </label>
                <select
                  value={newFeedbackTicketRef}
                  onChange={(e) => setNewFeedbackTicketRef(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer text-xs"
                >
                  <option value="General Experience">General Campus Infrastructure</option>
                  {issues.map((i) => (
                    <option key={i.id} value={`${i.id} (${i.title.substring(0, 30)}...)`}>
                      {i.id} - {i.building} ({i.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold uppercase text-[10px] mb-1">
                  Your Observations or Suggestions *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newFeedbackComment}
                  onChange={(e) => setNewFeedbackComment(e.target.value)}
                  placeholder="Share details about turnaround speed, technician courtesy, cleanliness, or portal experience..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition text-xs"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="anonCheck"
                  checked={newFeedbackIsAnonymous}
                  onChange={(e) => setNewFeedbackIsAnonymous(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="anonCheck" className="text-xs text-slate-600 font-medium cursor-pointer select-none">
                  Submit anonymously (hide name and branch)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 transition font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Feedback</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}