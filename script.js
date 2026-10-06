// ============================================
// SUPABASE CONNECTION
// ============================================

const SUPABASE_URL = "https://pcqnjersuxikgygemuef.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_2WqOqYdSooRt8QpRIqkEZA_RfgFSBW8";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const publicSupabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);

const state = {
  step: 1, type: "", businessName: "", description: "",
  features: [], video: "", budget: "", launch: ""
};

const featureMap = {
  "Business Website": ["Contact / enquiry form","WhatsApp integration","Services / product pages","Blog / news","Google Maps","Testimonials"],
  "E-commerce": ["Product catalogue","Shopping cart","Online payments","Customer login","Order management","Coupons / discounts","Inventory","Delivery integration"],
  "CRM": ["Lead management","Customer records","Task management","User roles","Reports / dashboard","Email notifications"],
  "Booking System": ["Availability calendar","Online booking","Customer details","Payment collection","Email notifications","Admin calendar"],
  "Healthcare": ["Doctor profiles","Appointment booking","Patient enquiry","Departments / services","Location & contact","Admin management"],
  "Custom Application": ["User login","Role-based access","Dashboard","Database","Reports","Notifications","Third-party integrations"],
  "AI Video & Visual Content": ["Website hero video","Product showcase video","Brand story video","Social media reels","Industry promotional video","Video editing / optimization"]
};

const planningTips = {
  "Business Website":"Focus on the pages that answer customer questions and create enquiries.",
  "E-commerce":"Start with the buying journey: products → cart → payment → order confirmation.",
  "CRM":"Define who will use the system and what each role needs to see.",
  "Booking System":"Availability, booking confirmation and admin management should be designed together.",
  "Healthcare":"Keep patient journeys simple and make essential information easy to find.",
  "Custom Application":"Start with the most important business workflow rather than trying to automate everything at once."
};

const videoRecommendations = {
  "Business Website":"A short brand or website hero video can introduce your business before visitors start reading.",
  "E-commerce":"Product showcase videos can demonstrate products and features while giving your store more visual depth.",
  "CRM":"A short product explainer can help prospects understand your CRM workflow before they request a demo.",
  "Booking System":"A service or experience video can show customers what to expect before they book.",
  "Healthcare":"A calm clinic or hospital introduction can explain facilities, departments and the patient experience.",
  "Custom Application":"A short product explainer can communicate a complex workflow more clearly than a long paragraph."
};

const menuToggle = document.getElementById("menuToggle");
const primaryNav = document.getElementById("primaryNav");
menuToggle.addEventListener("click", () => {
  const open = primaryNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});
document.querySelectorAll(".primary-nav a").forEach(a =>
  a.addEventListener("click", () => primaryNav.classList.remove("open"))
);

const steps = [...document.querySelectorAll(".builder-step")];
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");
const submitBtn = document.getElementById("submitBtn");
const stepLabel = document.getElementById("stepLabel");
const progressBar = document.getElementById("progressBar");
const featureList = document.getElementById("featureList");
const form = document.getElementById("projectForm");
const status = document.getElementById("formStatus");
const smartRecommendation = document.getElementById("smartRecommendation");
const videoRecommendation = document.getElementById("videoRecommendation");

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])
  );
}

function renderFeatures(type) {
  featureList.innerHTML = "";
  (featureMap[type] || featureMap["Custom Application"]).forEach(feature => {
    const label = document.createElement("label");
    label.className = "feature";
    label.innerHTML = `<input type="checkbox" value="${feature}"> <span>${feature}</span>`;
    featureList.appendChild(label);
  });
  smartRecommendation.innerHTML =
    `<strong>Planning tip:</strong> ${escapeHtml(planningTips[type] || "Choose the features that matter most to your customers and team.")}`;
}

function showStep(n) {
  state.step = n;
  steps.forEach(s => s.classList.toggle("active", Number(s.dataset.step) === n));
  stepLabel.textContent = `Step ${n} of 6`;
  progressBar.style.width = `${(n / 6) * 100}%`;
  backBtn.hidden = n === 1;
  nextBtn.hidden = n === 6;
  submitBtn.hidden = n !== 6;
  if (n === 6) buildSummary();
  document.querySelector(".builder-card").scrollIntoView({behavior:"smooth", block:"start"});
}

function validateStep() {
  status.textContent = "";
  if (state.step === 1 && !state.type) {
    status.textContent = "Please choose what you want to build.";
    return false;
  }
  if (state.step === 2) {
    const name = document.getElementById("businessName").value.trim();
    const desc = document.getElementById("businessDescription").value.trim();
    if (!name || !desc) {
      status.textContent = "Please add your business name and a short description.";
      return false;
    }
    state.businessName = name;
    state.description = desc;
  }
  if (state.step === 4 && !state.video) {
    status.textContent = "Please choose a visual-content option.";
    return false;
  }
  if (state.step === 5 && (!state.budget || !state.launch)) {
    status.textContent = "Please choose a budget range and a target launch window.";
    return false;
  }
  return true;
}

document.querySelectorAll("#projectTypes .choice").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#projectTypes .choice").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    state.type = btn.dataset.value;
    renderFeatures(state.type);
    state.video = "";
    document.querySelectorAll(".video-choice").forEach(b => b.classList.remove("selected"));
    videoRecommendation.innerHTML = "";
    status.textContent = "";
  });
});

featureList.addEventListener("change", () => {
  state.features = [...featureList.querySelectorAll("input:checked")].map(i => i.value);
});

document.querySelectorAll(".video-choice").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".video-choice").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    state.video = btn.dataset.video;
    const recommendation = state.video === "Not sure — recommend for me"
      ? (videoRecommendations[state.type] || "We'll recommend a video format after understanding your business and audience.")
      : `Selected: ${state.video}. ${videoRecommendations[state.type] || ""}`;
    videoRecommendation.innerHTML =
      `<strong>Our recommendation:</strong> ${escapeHtml(recommendation)}`;
    status.textContent = "";
  });
});

document.querySelectorAll(".budget").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".budget").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    state.budget = btn.dataset.value;
    status.textContent = "";
  });
});

document.querySelectorAll(".launch-option").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".launch-option").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    state.launch = btn.dataset.launch;
    status.textContent = "";
  });
});

nextBtn.addEventListener("click", () => {
  if (!validateStep()) return;
  if (state.step === 3) {
    state.features = [...featureList.querySelectorAll("input:checked")].map(i => i.value);
  }
  showStep(Math.min(6, state.step + 1));
});

backBtn.addEventListener("click", () => showStep(Math.max(1, state.step - 1)));

function buildSummary() {
  const selected = state.features.length ? state.features.join(", ") : "No specific features selected yet";
  document.getElementById("projectSummary").innerHTML =
    `<strong>Project:</strong> ${escapeHtml(state.type)}<br>
     <strong>Business:</strong> ${escapeHtml(state.businessName)}<br>
     <strong>Features:</strong> ${escapeHtml(selected)}<br>
     <strong>Visual content:</strong> ${escapeHtml(state.video || "Not selected")}<br>
     <strong>Budget:</strong> ${escapeHtml(state.budget || "Not selected")}<br>
     <strong>Launch:</strong> ${escapeHtml(state.launch || "Not selected")}`;
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  if (!validateStep()) return;

  status.textContent = "Submitting your project enquiry...";
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  const data = Object.fromEntries(new FormData(form).entries());

  const enquiry = {
    name: data.name || "",
    email: data.email || "",
    phone: data.phone || "",

    business_name: state.businessName,
    description: state.description,

    project_type: state.type,
    features: state.features,

    video_requirement: state.video,
    budget: state.budget,
    launch_timeline: state.launch,

    notes: data.notes || data.message || data.anythingElse || ""
  };

  console.log("Sending project enquiry:", enquiry);

  try {
    const turnstileResponse =
      document.querySelector(
        'input[name="cf-turnstile-response"]'
      )?.value;

    if (!turnstileResponse) {
      status.textContent =
        "Please complete the security verification and try again.";

      submitBtn.disabled = false;
      submitBtn.textContent = "Submit enquiry";

      return;
    }

    const response = await fetch(
      "https://pcqnjersuxikgygemuef.supabase.co/functions/v1/notify-new-enquiry",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          enquiry,
          turnstileToken: turnstileResponse
        })
      }
    );

    const result = await response.json();

    console.log("Edge Function response:", result);

    if (!response.ok || !result.success) {
      throw new Error(
        result.error || "Enquiry submission failed"
      );
    }

    status.textContent =
      "Thank you! Your project enquiry has been submitted successfully. We'll review it and get back to you.";

    submitBtn.textContent =
      "Enquiry submitted ✓";

    submitBtn.disabled = true;

  } catch (error) {

    console.error(
      "Project enquiry submission failed:",
      error
    );

    status.textContent =
      "We couldn't submit your enquiry right now. Please try again.";

    submitBtn.textContent =
      "Submit enquiry";

    submitBtn.disabled = false;

    if (
      typeof turnstile !== "undefined" &&
      typeof turnstile.reset === "function"
    ) {
      turnstile.reset();
    }
  }
});
document.querySelectorAll("[data-service]").forEach(link => {
  link.addEventListener("click", () => {
    const service = link.dataset.service;
    state.type = service;
    document.querySelectorAll("#projectTypes .choice").forEach(b =>
      b.classList.toggle("selected", b.dataset.value === service)
    );
    renderFeatures(service);
    showStep(1);
  });
});

document.getElementById("year").textContent = new Date().getFullYear();
