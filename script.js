// ======================================
// ROOMIEBUDGET - SAMPLE TRANSACTION DATA
// ======================================

// Helper: creates dates relative to today.
// This keeps sample data relevant whenever you open the app.
function getDateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);

  return date.toISOString().split("T")[0];
}

// Dashboard chart instances
let spendingChart = null;
let monthlyChart = null;
let trendChart = null;

// Sample transactions
const transactions = [
  {
    id: 1,
    name: "Groceries",
    category: "Food",
    type: "shared",
    amount: 1500,
    paidBy: "Daniel",
    date: getDateDaysAgo(0),
  },
  {
    id: 2,
    name: "Bus Fare",
    category: "Transport",
    type: "personal",
    amount: 200,
    paidBy: "Daniel",
    date: getDateDaysAgo(0),
  },
  {
    id: 3,
    name: "Shared Supplies",
    category: "Household",
    type: "shared",
    amount: 800,
    paidBy: "Daniel",
    date: getDateDaysAgo(1),
  },
  {
    id: 4,
    name: "Electricity Tokens",
    category: "Utilities",
    type: "shared",
    amount: 1000,
    paidBy: "Roommate 1",
    date: getDateDaysAgo(3),
  },
  {
    id: 5,
    name: "Lunch",
    category: "Food",
    type: "personal",
    amount: 450,
    paidBy: "Daniel",
    date: getDateDaysAgo(5),
  },
  {
    id: 6,
    name: "Internet",
    category: "Utilities",
    type: "shared",
    amount: 2500,
    paidBy: "Roommate 2",
    date: getDateDaysAgo(9),
  },
  {
    id: 7,
    name: "Shopping",
    category: "Personal Care",
    type: "personal",
    amount: 1200,
    paidBy: "Daniel",
    date: getDateDaysAgo(14),
  },
  {
    id: 8,
    name: "Water Bill",
    category: "Utilities",
    type: "shared",
    amount: 900,
    paidBy: "Daniel",
    date: getDateDaysAgo(25),
  },
  {
    id: 9,
    name: "House Cleaning Items",
    category: "Household",
    type: "shared",
    amount: 1100,
    paidBy: "Roommate 1",
    date: getDateDaysAgo(40),
  },
  {
    id: 10,
    name: "Personal Shopping",
    category: "Personal Care",
    type: "personal",
    amount: 1800,
    paidBy: "Daniel",
    date: getDateDaysAgo(65),
  },
  {
    id: 11,
    name: "House Rent",
    category: "Rent",
    type: "shared",
    amount: 12000,
    paidBy: "Daniel",
    date: getDateDaysAgo(100),
  },
  {
    id: 12,
    name: "Transport",
    category: "Transport",
    type: "personal",
    amount: 350,
    paidBy: "Daniel",
    date: getDateDaysAgo(190),
  },
];
// ======================================
// DASHBOARD PERIOD FILTER & CALCULATIONS
// ======================================

const PERSONAL_BUDGET = 10000;

// Convert YYYY-MM-DD into a local date
function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Remove time from a date
function getStartOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Get the selected period's date range
function getPeriodRange(period) {
  const today = getStartOfDay(new Date());

  let startDate;
  let endDate = new Date(today);

  switch (period) {
    case "today":
      startDate = new Date(today);
      break;

    case "week":
      startDate = new Date(today);
      startDate.setDate(today.getDate() - ((today.getDay() + 6) % 7));
      break;

    case "month":
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      break;

    case "semester": {
      // Temporary default: calendar half-year.
      // We will make this editable in Settings later.
      const month = today.getMonth();

      if (month < 6) {
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 5, 30);
      } else {
        startDate = new Date(today.getFullYear(), 6, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
      }
      break;
    }

    case "year":
      startDate = new Date(today.getFullYear(), 0, 1);
      break;

    default:
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  }

  return { startDate, endDate };
}

// Filter transactions according to the selected period
function getFilteredTransactions(period) {
  const { startDate, endDate } = getPeriodRange(period);

  return transactions.filter((transaction) => {
    const transactionDate = parseLocalDate(transaction.date);

    return transactionDate >= startDate && transactionDate <= endDate;
  });
}

// Calculate dashboard figures
function calculateDashboardTotals(filteredTransactions) {
  const personalTransactions = filteredTransactions.filter(
    (transaction) => transaction.type === "personal",
  );

  const sharedTransactions = filteredTransactions.filter(
    (transaction) => transaction.type === "shared",
  );

  const personalSpending = personalTransactions.reduce(
    (total, transaction) => total + transaction.amount,
    0,
  );

  const sharedSpending = sharedTransactions.reduce(
    (total, transaction) => total + transaction.amount,
    0,
  );

  const remainingBudget = PERSONAL_BUDGET - personalSpending;

  const spendingPercentage =
    PERSONAL_BUDGET > 0 ? (personalSpending / PERSONAL_BUDGET) * 100 : 0;

  return {
    personalSpending,
    sharedSpending,
    remainingBudget,
    spendingPercentage,
  };
}

// Format amounts in Kenyan shillings
function formatCurrency(amount) {
  return "KSh " + amount.toLocaleString("en-KE");
}

// Update dashboard summary cards and budget progress
function updateDashboardSummary(totals) {
  const {
    personalSpending,
    sharedSpending,
    remainingBudget,
    spendingPercentage,
  } = totals;

  const budgetElement = document.getElementById("summaryBudget");
  const personalElement = document.getElementById("summaryPersonalSpending");
  const sharedElement = document.getElementById("summarySharedExpenses");
  const personalNote = document.getElementById("personalSpendingNote");
  const percentageElement = document.getElementById("budgetPercentage");
  const progressFill = document.getElementById("budgetProgressFill");
  const spentElement = document.getElementById("budgetSpent");
  const remainingElement = document.getElementById("budgetRemaining");

  if (budgetElement) {
    budgetElement.textContent = formatCurrency(PERSONAL_BUDGET);
  }

  if (personalElement) {
    personalElement.textContent = formatCurrency(personalSpending);
  }

  if (sharedElement) {
    sharedElement.textContent = formatCurrency(sharedSpending);
  }

  if (personalNote) {
    personalNote.textContent = `${spendingPercentage.toFixed(1)}% of your budget`;
  }

  if (percentageElement) {
    percentageElement.textContent = `${spendingPercentage.toFixed(1)}%`;
  }

  if (progressFill) {
    progressFill.style.width = `${Math.min(spendingPercentage, 100)}%`;
  }

  if (spentElement) {
    spentElement.textContent = `Spent: ${formatCurrency(personalSpending)}`;
  }

  if (remainingElement) {
    remainingElement.textContent = `Remaining: ${formatCurrency(remainingBudget)}`;
  }
}

// ======================================
// DISPLAY RECENT TRANSACTIONS
// ======================================

function renderRecentTransactions(filteredTransactions) {
  const transactionList = document.getElementById("transactionList");

  if (!transactionList) return;

  // Show the latest transactions first
  const recentTransactions = [...filteredTransactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (recentTransactions.length === 0) {
    transactionList.innerHTML = `
            <p class="empty-message">
                No transactions recorded for this period.
            </p>
        `;
    return;
  }

  transactionList.innerHTML = recentTransactions
    .map((transaction) => {
      const transactionType =
        transaction.type === "personal" ? "Personal" : "Shared";

      const formattedDate = parseLocalDate(transaction.date).toLocaleDateString(
        "en-KE",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        },
      );

      return `
            <div class="transaction-item">
                <div>
                    <strong>${transaction.name}</strong>
                    <span>
                        ${transactionType} · ${transaction.category} · ${formattedDate}
                    </span>
                </div>

                <strong>-${formatCurrency(transaction.amount)}</strong>
            </div>
        `;
    })
    .join("");
}

// Refresh dashboard when the period changes
function refreshDashboard() {
  const periodFilter = document.getElementById("periodFilter");

  if (!periodFilter) return;

  const filteredTransactions = getFilteredTransactions(periodFilter.value);

  const totals = calculateDashboardTotals(filteredTransactions);

  updateDashboardSummary(totals);
  renderRecentTransactions(filteredTransactions);
  updateDashboardCharts(filteredTransactions, periodFilter.value);
}

// Listen for period selection changes
const periodFilter = document.getElementById("periodFilter");

if (periodFilter) {
  periodFilter.addEventListener("change", refreshDashboard);
  refreshDashboard();
}

// GET THE HTML ELEMENTS
const appContainer = document.getElementById("appContainer");
const menuToggle = document.getElementById("menuToggle");
const navigationLinks = document.querySelectorAll(".nav-link");

const pageTitle = document.getElementById("pageTitle");
const welcomeTitle = document.getElementById("welcomeTitle");
const welcomeText = document.getElementById("welcomeText");

// SIDEBAR EXPAND AND COLLAPSE

// RESTORE SIDEBAR STATE WHEN A PAGE LOADS
const savedSidebarState = localStorage.getItem("roomieSidebarCollapsed");

// Default to collapsed if no previous preference exists
if (savedSidebarState === null || savedSidebarState === "true") {
  appContainer.classList.add("sidebar-collapsed");
} else {
  appContainer.classList.remove("sidebar-collapsed");
}

// Update the button accessibility state
const initiallyExpanded = !appContainer.classList.contains("sidebar-collapsed");

menuToggle.setAttribute("aria-expanded", initiallyExpanded);
menuToggle.setAttribute(
  "aria-label",
  initiallyExpanded ? "Collapse navigation" : "Expand navigation",
);

// SIDEBAR TOGGLE
menuToggle.addEventListener("click", function () {
  appContainer.classList.toggle("sidebar-collapsed");

  const isExpanded = !appContainer.classList.contains("sidebar-collapsed");

  // Remember the selected state
  localStorage.setItem("roomieSidebarCollapsed", !isExpanded);

  menuToggle.setAttribute("aria-expanded", isExpanded);
  menuToggle.setAttribute(
    "aria-label",
    isExpanded ? "Collapse navigation" : "Expand navigation",
  );
});

// 2. NAVIGATION TAB SELECTION
navigationLinks.forEach(function (link) {
  // Copy the navigation button so we can extract its label
  const labelElement = link.cloneNode(true);
  // Remove the icon from the copied button
  const iconElement = labelElement.querySelector("span");

  if (iconElement) {
    iconElement.remove();
  }

  // Use only the remaining text as the tooltip
  link.setAttribute("data-tooltip", labelElement.textContent.trim());
  link.addEventListener("click", function (event) {
    if (link.getAttribute("href") !== "#") return;
    // Prevent the browser from opening another page
    event.preventDefault();

    // Remove active status from all tabs
    navigationLinks.forEach(function (item) {
      item.classList.remove("active");
    });

    // Highlight the clicked tab
    link.classList.add("active");

    // Get the selected tab's name
    const selectedPage = link.dataset.page;

    // Get its visible text
    const selectedName = link.textContent.trim();

    // Update the top bar heading
    pageTitle.textContent = selectedName;

    // Update the welcome section
    welcomeTitle.textContent = selectedName;

    welcomeText.textContent =
      "Welcome to your " +
      selectedName +
      " section. Your page content will appear here.";
  });
});

// ======================================
// DYNAMIC DASHBOARD CHARTS
// ======================================

// Create chart time intervals
function getChartBuckets(period) {
  const { startDate, endDate } = getPeriodRange(period);
  const buckets = [];

  // Today: one bucket
  if (period === "today") {
    return [
      {
        label: "Today",
        start: startDate,
        end: endDate,
      },
    ];
  }

  // This week: seven daily buckets
  if (period === "week") {
    for (let i = 0; i < 7; i++) {
      const start = new Date(startDate);
      start.setDate(startDate.getDate() + i);

      buckets.push({
        label: start.toLocaleDateString("en-KE", {
          weekday: "short",
        }),
        start,
        end: start,
      });
    }

    return buckets;
  }

  // This month: weekly buckets
  if (period === "month") {
    let current = new Date(startDate);
    let week = 1;

    while (current <= endDate) {
      const start = new Date(current);
      const end = new Date(current);

      end.setDate(end.getDate() + 6);

      if (end > endDate) {
        end.setTime(endDate.getTime());
      }

      buckets.push({
        label: `Week ${week}`,
        start,
        end,
      });

      current.setDate(current.getDate() + 7);
      week++;
    }

    return buckets;
  }

  // Semester and year: monthly buckets
  let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  while (current <= endDate) {
    const start = new Date(current);

    const end = new Date(current.getFullYear(), current.getMonth() + 1, 0);

    buckets.push({
      label: current.toLocaleDateString("en-KE", {
        month: "short",
      }),
      start,
      end,
    });

    current.setMonth(current.getMonth() + 1);
  }

  return buckets;
}

// Calculate spending for each time interval
function getBucketTotals(filteredTransactions, buckets) {
  return buckets.map((bucket) => {
    const bucketTransactions = filteredTransactions.filter((transaction) => {
      const date = parseLocalDate(transaction.date);

      return date >= bucket.start && date <= bucket.end;
    });

    const personal = bucketTransactions
      .filter((item) => item.type === "personal")
      .reduce((sum, item) => sum + item.amount, 0);

    const shared = bucketTransactions
      .filter((item) => item.type === "shared")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      personal,
      shared,
      total: personal + shared,
    };
  });
}

// Create or update the spending breakdown chart
function updateSpendingChart(filteredTransactions) {
  const canvas = document.getElementById("spendingChart");

  if (!canvas || typeof Chart === "undefined") return;

  const personalTransactions = filteredTransactions.filter(
    (item) => item.type === "personal",
  );

  const categoryTotals = {};

  personalTransactions.forEach((transaction) => {
    categoryTotals[transaction.category] =
      (categoryTotals[transaction.category] || 0) + transaction.amount;
  });

  const labels = Object.keys(categoryTotals);
  const values = Object.values(categoryTotals);

  if (spendingChart) {
    spendingChart.data.labels = labels;
    spendingChart.data.datasets[0].data = values;
    spendingChart.update();
    return;
  }

  spendingChart = new Chart(canvas, {
    type: "doughnut",

    data: {
      labels,
      datasets: [
        {
          label: "Personal Spending",
          data: values,
          backgroundColor: [
            "#218c43",
            "#333333",
            "#83c995",
            "#c9d8cc",
            "#9bc7a8",
            "#777777",
          ],
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

// Create or update monthly spending comparison
function updateMonthlyChart(filteredTransactions, period) {
  const canvas = document.getElementById("monthlyChart");

  if (!canvas || typeof Chart === "undefined") return;

  const buckets = getChartBuckets(period);
  const totals = getBucketTotals(filteredTransactions, buckets);

  const labels = buckets.map((bucket) => bucket.label);
  const personalData = totals.map((item) => item.personal);
  const sharedData = totals.map((item) => item.shared);

  if (monthlyChart) {
    monthlyChart.data.labels = labels;
    monthlyChart.data.datasets[0].data = personalData;
    monthlyChart.data.datasets[1].data = sharedData;
    monthlyChart.update();
    return;
  }

  monthlyChart = new Chart(canvas, {
    type: "bar",

    data: {
      labels,

      datasets: [
        {
          label: "Personal Spending",
          data: personalData,
          backgroundColor: "#218c43",
        },
        {
          label: "Shared Spending",
          data: sharedData,
          backgroundColor: "#333333",
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          position: "bottom",
        },
      },

      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

// Create or update spending trend
function updateTrendChart(filteredTransactions, period) {
  const canvas = document.getElementById("trendChart");

  if (!canvas || typeof Chart === "undefined") return;

  const buckets = getChartBuckets(period);
  const totals = getBucketTotals(filteredTransactions, buckets);

  const labels = buckets.map((bucket) => bucket.label);
  const spendingData = totals.map((item) => item.total);

  if (trendChart) {
    trendChart.data.labels = labels;
    trendChart.data.datasets[0].data = spendingData;
    trendChart.update();
    return;
  }

  trendChart = new Chart(canvas, {
    type: "line",

    data: {
      labels,

      datasets: [
        {
          label: "Total Spending",
          data: spendingData,
          borderColor: "#218c43",
          backgroundColor: "rgba(33, 140, 67, 0.12)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          position: "bottom",
        },
      },

      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

// Update all dashboard charts
function updateDashboardCharts(filteredTransactions, period) {
  updateSpendingChart(filteredTransactions);
  updateMonthlyChart(filteredTransactions, period);
  updateTrendChart(filteredTransactions, period);
}

// Initialize dashboard charts after all chart functions are ready
refreshDashboard();

/* =========================================
   ROOMIEBUDGET SETTINGS FUNCTIONALITY
========================================= */

(function () {
  const settingsKey = "roomieBudgetSettings";

  const defaultSettings = {
    semesters: [],
    defaultPeriod: "month",
    customStart: "",
    customEnd: "",
    defaultBudget: 10000,
    budgetPeriod: "monthly",
    currency: "KES",
    defaultSharing: "equal",
    settlementPreference: "manual",
    notifications: {
      budget: true,
      expenses: true,
      settlements: true,
      savings: true,
    },
    profile: {
      name: "",
      email: "",
      phone: "",
    },
  };

  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(settingsKey));

      if (!saved || typeof saved !== "object") {
        return structuredClone(defaultSettings);
      }

      return {
        ...defaultSettings,
        ...saved,
        notifications: {
          ...defaultSettings.notifications,
          ...(saved.notifications || {}),
        },
        profile: {
          ...defaultSettings.profile,
          ...(saved.profile || {}),
        },
        semesters: Array.isArray(saved.semesters) ? saved.semesters : [],
      };
    } catch (error) {
      console.error("Could not load settings:", error);
      return structuredClone(defaultSettings);
    }
  }

  let settings = loadSettings();
  let editingSemesterId = null;

  function saveSettings() {
    try {
      localStorage.setItem(settingsKey, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error("Could not save settings:", error);
      showMessage("Settings could not be saved in this browser.");
      return false;
    }
  }

  function showMessage(message) {
    const messageBox = document.getElementById("settingsMessage");

    if (!messageBox) return;

    messageBox.textContent = message;
    messageBox.classList.add("show");

    setTimeout(() => {
      messageBox.classList.remove("show");
    }, 3500);
  }

  // -----------------------------------------
  // SEMESTER CONFIGURATION
  // -----------------------------------------

  const semesterForm = document.getElementById("semesterForm");

  const semesterName = document.getElementById("semesterName");
  const semesterStart = document.getElementById("semesterStart");
  const semesterEnd = document.getElementById("semesterEnd");
  const semesterList = document.getElementById("semesterList");

  const semesterSubmitBtn = document.getElementById("semesterSubmitBtn");
  const cancelSemesterEdit = document.getElementById("cancelSemesterEdit");

  function resetSemesterForm() {
    semesterForm.reset();
    editingSemesterId = null;
    semesterSubmitBtn.textContent = "Add Semester";
    cancelSemesterEdit.hidden = true;
  }

  function renderSemesters() {
    if (!semesterList) return;

    if (settings.semesters.length === 0) {
      semesterList.innerHTML =
        '<p class="settings-empty">No semesters added yet.</p>';
      return;
    }

    semesterList.innerHTML = settings.semesters
      .map(
        (semester) => `
            <div class="semester-item">
                <div class="semester-details">
                    <strong>${escapeHTML(semester.name)}</strong>
                    <span>${semester.start} to ${semester.end}</span>
                </div>

                <div class="semester-actions">
                    <button type="button"
                        data-semester-edit="${semester.id}">
                        Edit
                    </button>

                    <button type="button"
                        class="delete-semester"
                        data-semester-delete="${semester.id}">
                        Delete
                    </button>
                </div>
            </div>
        `,
      )
      .join("");
  }

  function escapeHTML(value) {
    return String(value).replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        })[character],
    );
  }

  if (semesterForm) {
    semesterForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const name = semesterName.value.trim();
      const start = semesterStart.value;
      const end = semesterEnd.value;

      if (!name || !start || !end) {
        showMessage("Please complete all semester fields.");
        return;
      }

      if (start > end) {
        showMessage("The semester end date must be after its start date.");
        return;
      }

      if (editingSemesterId) {
        const semester = settings.semesters.find(
          (item) => item.id === editingSemesterId,
        );

        if (semester) {
          semester.name = name;
          semester.start = start;
          semester.end = end;
        }
      } else {
        settings.semesters.push({
          id: String(Date.now()),
          name,
          start,
          end,
        });
      }

      if (saveSettings()) {
        renderSemesters();
        resetSemesterForm();
        showMessage("Semester settings saved successfully.");
      }
    });
  }

  if (semesterList) {
    semesterList.addEventListener("click", function (event) {
      const editButton = event.target.closest("[data-semester-edit]");
      const deleteButton = event.target.closest("[data-semester-delete]");

      if (editButton) {
        const id = editButton.dataset.semesterEdit;

        const semester = settings.semesters.find((item) => item.id === id);

        if (!semester) return;

        editingSemesterId = id;
        semesterName.value = semester.name;
        semesterStart.value = semester.start;
        semesterEnd.value = semester.end;

        semesterSubmitBtn.textContent = "Update Semester";
        cancelSemesterEdit.hidden = false;

        semesterForm.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }

      if (deleteButton) {
        const id = deleteButton.dataset.semesterDelete;

        const confirmed = confirm(
          "Are you sure you want to delete this semester configuration?",
        );

        if (!confirmed) return;

        settings.semesters = settings.semesters.filter(
          (item) => item.id !== id,
        );

        if (saveSettings()) {
          renderSemesters();
          showMessage("Semester configuration deleted.");
        }
      }
    });
  }

  if (cancelSemesterEdit) {
    cancelSemesterEdit.addEventListener("click", resetSemesterForm);
  }

  // -----------------------------------------
  // DEFAULT DASHBOARD PERIOD
  // -----------------------------------------

  const defaultPeriod = document.getElementById("defaultPeriod");
  const defaultCustomRange = document.getElementById("defaultCustomRange");

  const defaultCustomStart = document.getElementById("defaultCustomStart");

  const defaultCustomEnd = document.getElementById("defaultCustomEnd");

  function updateCustomRangeVisibility() {
    if (!defaultPeriod || !defaultCustomRange) return;

    defaultCustomRange.hidden = defaultPeriod.value !== "custom";
  }

  if (defaultPeriod) {
    defaultPeriod.addEventListener("change", updateCustomRangeVisibility);
  }

  const savePeriodSettings = document.getElementById("savePeriodSettings");

  if (savePeriodSettings) {
    savePeriodSettings.addEventListener("click", function () {
      settings.defaultPeriod = defaultPeriod.value;

      if (defaultPeriod.value === "custom") {
        const start = defaultCustomStart.value;
        const end = defaultCustomEnd.value;

        if (!start || !end || start > end) {
          showMessage("Please enter a valid custom date range.");
          return;
        }

        settings.customStart = start;
        settings.customEnd = end;
      }

      if (
        settings.defaultPeriod === "semester" &&
        settings.semesters.length === 0
      ) {
        showMessage("Add a semester before selecting this period.");
        return;
      }

      if (saveSettings()) {
        showMessage("Dashboard period preference saved.");
      }
    });
  }

  // -----------------------------------------
  // PERSONAL BUDGET PREFERENCES
  // -----------------------------------------

  const saveBudgetSettings = document.getElementById("saveBudgetSettings");

  if (saveBudgetSettings) {
    saveBudgetSettings.addEventListener("click", function () {
      const amount = Number(document.getElementById("defaultBudget").value);

      if (!Number.isFinite(amount) || amount < 0) {
        showMessage("Enter a valid budget amount.");
        return;
      }

      settings.defaultBudget = amount;
      settings.budgetPeriod = document.getElementById("budgetPeriod").value;
      settings.currency = document.getElementById("currency").value;

      if (saveSettings()) {
        showMessage("Budget preferences saved.");
      }
    });
  }

  // -----------------------------------------
  // HOUSEHOLD PREFERENCES
  // -----------------------------------------

  const saveHouseholdSettings = document.getElementById(
    "saveHouseholdSettings",
  );

  if (saveHouseholdSettings) {
    saveHouseholdSettings.addEventListener("click", function () {
      settings.defaultSharing = document.getElementById("defaultSharing").value;

      settings.settlementPreference = document.getElementById(
        "settlementPreference",
      ).value;

      if (saveSettings()) {
        showMessage("Household preferences saved.");
      }
    });
  }

  // -----------------------------------------
  // NOTIFICATION PREFERENCES
  // -----------------------------------------

  const saveNotificationSettings = document.getElementById(
    "saveNotificationSettings",
  );

  if (saveNotificationSettings) {
    saveNotificationSettings.addEventListener("click", function () {
      settings.notifications = {
        budget: document.getElementById("budgetAlerts").checked,
        expenses: document.getElementById("expenseAlerts").checked,
        settlements: document.getElementById("settlementAlerts").checked,
        savings: document.getElementById("savingsAlerts").checked,
      };

      if (saveSettings()) {
        showMessage("Notification preferences saved.");
      }
    });
  }

  // -----------------------------------------
  // PROFILE SETTINGS
  // -----------------------------------------

  const saveProfileSettings = document.getElementById("saveProfileSettings");

  if (saveProfileSettings) {
    saveProfileSettings.addEventListener("click", function () {
      settings.profile = {
        name: document.getElementById("profileName").value.trim(),
        email: document.getElementById("profileEmail").value.trim(),
        phone: document.getElementById("profilePhone").value.trim(),
      };

      if (saveSettings()) {
        showMessage("Profile information saved.");
      }
    });
  }

  // -----------------------------------------
  // EXPORT SETTINGS
  // -----------------------------------------

  const exportSettings = document.getElementById("exportSettings");

  if (exportSettings) {
    exportSettings.addEventListener("click", function () {
      const fileContent = JSON.stringify(settings, null, 2);

      const file = new Blob([fileContent], { type: "application/json" });

      const downloadURL = URL.createObjectURL(file);
      const link = document.createElement("a");

      link.href = downloadURL;
      link.download = "roomiebudget-settings.json";
      link.click();

      URL.revokeObjectURL(downloadURL);

      showMessage("Settings export prepared.");
    });
  }

  // -----------------------------------------
  // LOAD SAVED VALUES INTO THE FORM
  // -----------------------------------------

  function loadFormValues() {
    if (!document.getElementById("settingsPage")) return;

    renderSemesters();

    document.getElementById("defaultPeriod").value = settings.defaultPeriod;

    document.getElementById("defaultCustomStart").value = settings.customStart;

    document.getElementById("defaultCustomEnd").value = settings.customEnd;

    document.getElementById("defaultBudget").value = settings.defaultBudget;

    document.getElementById("budgetPeriod").value = settings.budgetPeriod;

    document.getElementById("currency").value = settings.currency;

    document.getElementById("defaultSharing").value = settings.defaultSharing;

    document.getElementById("settlementPreference").value =
      settings.settlementPreference;

    document.getElementById("budgetAlerts").checked =
      settings.notifications.budget;

    document.getElementById("expenseAlerts").checked =
      settings.notifications.expenses;

    document.getElementById("settlementAlerts").checked =
      settings.notifications.settlements;

    document.getElementById("savingsAlerts").checked =
      settings.notifications.savings;

    document.getElementById("profileName").value = settings.profile.name;

    document.getElementById("profileEmail").value = settings.profile.email;

    document.getElementById("profilePhone").value = settings.profile.phone;

    updateCustomRangeVisibility();
  }

  loadFormValues();
})();

// BACK TO TOP BUTTON
const backToTopButton = document.createElement("button");

backToTopButton.className = "back-to-top";
backToTopButton.innerHTML = "↑";
backToTopButton.setAttribute("aria-label", "Back to top");

document.body.appendChild(backToTopButton);

// Show button after scrolling down
window.addEventListener("scroll", function () {
  if (window.scrollY > 300) {
    backToTopButton.classList.add("show");
  } else {
    backToTopButton.classList.remove("show");
  }
});

// Smoothly return to the top
backToTopButton.addEventListener("click", function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});
