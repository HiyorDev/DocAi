// ===============================
// API CONNECTION
// ===============================

const API_BASE_URL = "https://docai-0uf4.onrender.com";

//
async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/documents`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  return await response.json();
}


async function askQuestion(question, documentId) {
  const response = await fetch(
      `${API_BASE_URL}/documents/${documentId}/ask`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: question
        })
      }
  );

  if (!response.ok) {
    throw new Error("Question failed");
  }

  const data = await response.json();

  return data.answer;
}


function mockDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


// ===============================
// STATE
// ===============================

let selectedFile = null;
let currentDocumentId = null;

// ===============================
// DOM REFERENCES
// ===============================

const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const dropzoneIdle = document.getElementById("dropzoneIdle");
const dropzoneFile = document.getElementById("dropzoneFile");
const fileExt = document.getElementById("fileExt");
const fileName = document.getElementById("fileName");
const fileState = document.getElementById("fileState");
const removeFileBtn = document.getElementById("removeFile");
const uploadBtn = document.getElementById("uploadBtn");

const uploadScreen = document.getElementById("uploadScreen");
const chatScreen = document.getElementById("chatScreen");
const chatDocName = document.getElementById("chatDocName");
const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const newDocBtn = document.getElementById("newDocBtn");

const ALLOWED_EXTENSIONS = ["pdf", "docx", "xlsx"];

// ===============================
// FILE SELECTION
// ===============================

dropzone.addEventListener("click", () => fileInput.click());

dropzone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener("change", (e) => {
  if (e.target.files.length) handleFileSelect(e.target.files[0]);
});

["dragenter", "dragover"].forEach((evt) => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });
});

["dragleave", "drop"].forEach((evt) => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
  });
});

dropzone.addEventListener("drop", (e) => {
  if (e.dataTransfer.files.length) handleFileSelect(e.dataTransfer.files[0]);
});

removeFileBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  clearFileSelection();
});

function handleFileSelect(file) {
  const ext = file.name.split(".").pop().toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    // Simple, discreet feedback without adding new UI elements
    fileInput.value = "";
    dropzone.classList.add("dragover");
    setTimeout(() => dropzone.classList.remove("dragover"), 200);
    return;
  }

  selectedFile = file;

  fileExt.textContent = ext.toUpperCase();
  fileName.textContent = file.name;
  fileState.textContent = "Selected";
  fileState.classList.remove("ready");

  dropzoneIdle.hidden = true;
  dropzoneFile.hidden = false;

  uploadBtn.disabled = false;

  // Small delayed transition from "Selected" to "Ready"
  setTimeout(() => {
    if (selectedFile === file) {
      fileState.textContent = "Ready to upload";
      fileState.classList.add("ready");
    }
  }, 450);
}

function clearFileSelection() {
  selectedFile = null;
  fileInput.value = "";
  dropzoneFile.hidden = true;
  dropzoneIdle.hidden = false;
  uploadBtn.disabled = true;
}

// ===============================
// UPLOAD FLOW
// ===============================

uploadBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  uploadBtn.disabled = true;
  uploadBtn.textContent = "Uploading...";

  try {
    const result = await uploadDocument(selectedFile);

    console.log("DOCUMENTO RECIBIDO:", result);

    //ID DOCUMENT
    currentDocumentId = result.document_id;

    console.log("DOCUMENT ID:", currentDocumentId);

    transitionToChat(result.filename);

  } catch (err) {
    console.error("Upload failed:", err);

    uploadBtn.textContent = "Upload document";
    uploadBtn.disabled = false;
  }
});

function transitionToChat(filename) {
  chatDocName.textContent = filename;
  chatLog.innerHTML = "";

  uploadScreen.classList.add("leaving");

  setTimeout(() => {
    uploadScreen.hidden = true;
    chatScreen.hidden = false;
    chatScreen.classList.add("entering");
    chatInput.focus();
  }, 300);
}

// ===============================
// NEW DOCUMENT (reset)
// ===============================

newDocBtn.addEventListener("click", () => {
  currentDocumentId = null;
  clearFileSelection();

  uploadBtn.textContent = "Upload document";
  uploadBtn.disabled = true;

  chatScreen.hidden = true;
  chatScreen.classList.remove("entering");

  uploadScreen.hidden = false;
  uploadScreen.classList.remove("leaving");
});

// ===============================
// CHAT FLOW
// ===============================

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = chatInput.value.trim();
  if (!question) return;

  addMessage(question, "user");
  chatInput.value = "";
  setChatInputEnabled(false);

  const thinkingEl = addThinkingIndicator();

  try {
    const answer = await askQuestion(question, currentDocumentId);
    thinkingEl.remove();
    addMessage(answer, "ai");
  } catch (err) {
    // TODO: surface a real error state once the backend is connected
    console.error("Ask failed:", err);
    thinkingEl.remove();
    addMessage("Something went wrong reaching the backend.", "ai");
  } finally {
    setChatInputEnabled(true);
    chatInput.focus();
  }
});

function addMessage(text, role) {
  const el = document.createElement("div");
  el.className = `message message--${role}`;
  el.textContent = text;
  chatLog.appendChild(el);
  chatLog.scrollTop = chatLog.scrollHeight;
  return el;
}

function addThinkingIndicator() {
  const el = document.createElement("div");
  el.className = "message message--thinking";
  el.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
  chatLog.appendChild(el);
  chatLog.scrollTop = chatLog.scrollHeight;
  return el;
}

function setChatInputEnabled(enabled) {
  chatInput.disabled = !enabled;
  sendBtn.disabled = !enabled;
}

// ===============================
// API STATUS INDICATOR
// ===============================
// Reflects API_BASE_URL above. Once you set a real backend URL,
// this will automatically switch to a "connected" look.

function updateApiStatus() {
  const statusText = document.getElementById("statusText");
  const statusDot = document.getElementById("statusDot");

  if (API_BASE_URL) {
    statusText.textContent = "API: Connected";
    statusDot.classList.add("connected");
  } else {
    statusText.textContent = "API: Not connected";
    statusDot.classList.remove("connected");
  }
}

updateApiStatus();
