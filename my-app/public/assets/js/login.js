// js/login.js

document.addEventListener("DOMContentLoaded", () => {
  // Check if user is already logged in, redirect them
  if (window.AuthService) {
    const currentUser = window.AuthService.getCurrentUser();
    if (currentUser) {
      if (currentUser.isAdmin) {
        window.location.href = "admin-dashboard.html";
      } else {
        window.location.href = "profile.html";
      }
      return;
    }
  }

  // Bind form submits
  const loginForm = document.getElementById("auth-login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);
  }

  const registerForm = document.getElementById("auth-register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegisterSubmit);
  }

  // Check URL query parameters for default tab
  const mode = window.getUrlParam ? window.getUrlParam("mode") : "";
  if (mode === "register") {
    switchAuthTab("register");
  }
});

// Switch tab login vs register
window.switchAuthTab = function(tabName) {
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const panelLogin = document.getElementById("panel-login");
  const panelRegister = document.getElementById("panel-register");
  const authContainer = document.getElementById("auth-page-container");

  if (!tabLogin || !tabRegister || !panelLogin || !panelRegister) return;

  if (authContainer) authContainer.dataset.authMode = tabName === "register" ? "register" : "login";

  if (tabName === "login") {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    panelLogin.classList.add("active");
    panelRegister.classList.remove("active");
  } else {
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
    panelRegister.classList.add("active");
    panelLogin.classList.remove("active");
  }
};

window.togglePasswordVisibility = function(inputId, button) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.type = input.type === "password" ? "text" : "password";
  if (button) button.classList.toggle("is-visible", input.type === "text");
};

// Handle Login submit
function handleLoginSubmit(e) {
  e.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const remember = document.getElementById("login-remember").checked;

  if (!window.AuthService) return;

  const result = window.AuthService.login(email, password, remember);

  if (result.success) {
    window.showToast(result.message, "success");
    
    // Check if we came from checkout
    const referrer = document.referrer;
    setTimeout(() => {
      if (result.user.isAdmin) {
        window.location.href = "admin-dashboard.html";
      } else if (referrer && referrer.includes("checkout.html")) {
        window.location.href = "checkout.html";
      } else if (referrer && referrer.includes("cart.html")) {
        window.location.href = "checkout.html";
      } else {
        window.location.href = "profile.html";
      }
    }, 1000);
  } else {
    window.showToast(result.message, "error");
  }
}

// Handle Register submit
function handleRegisterSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("register-name").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const phone = document.getElementById("register-phone").value.trim();
  const password = document.getElementById("register-password").value;
  const goal = document.getElementById("register-goal").value;

  if (!window.AuthService) return;

  const result = window.AuthService.register(name, email, phone, password, goal);

  if (result.success) {
    window.showToast(result.message, "success");
    // Switch to login tab and prefill email
    setTimeout(() => {
      switchAuthTab("login");
      const emailField = document.getElementById("login-email");
      if (emailField) {
        emailField.value = email;
        document.getElementById("login-password").focus();
      }
    }, 1500);
  } else {
    window.showToast(result.message, "error");
  }
}

// Forgot Password Helper
window.handleForgotPassword = function(e) {
  e.preventDefault();
  
  const isEn = document.body.classList.contains("lang-en");
  const msgVi = "Hệ thống đã gửi liên kết khôi phục mật khẩu vào Email của bạn (Mô phỏng). Vui lòng kiểm tra hộp thư.";
  const msgEn = "We have sent a password reset link to your email (Mockup). Please check your inbox.";
  
  window.showToast(isEn ? msgEn : msgVi, "success");
};

window.handleGoogleLogin = function() {
  try {
    if (typeof google === "undefined" || !google.accounts || !google.accounts.oauth2) {
      window.showToast("Google Login SDK is loading, please wait...", "info");
      return;
    }
    
    // Use user's real Google Client ID as default, allow localStorage override if needed
    const clientId = localStorage.getItem("tqg_google_client_id") || "1011167322512-od2uphf25qg5bcbd909qekukrkb80veb.apps.googleusercontent.com";
    
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
      callback: (tokenResponse) => {
        if (tokenResponse && tokenResponse.access_token) {
          window.showToast("Google account authorized! Retrieving profile...", "info");
          
          fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
          })
          .then(res => {
            if (!res.ok) throw new Error("Failed to fetch profile");
            return res.json();
          })
          .then(userInfo => {
            if (!window.AuthService) return;
            const result = window.AuthService.loginOrRegisterGoogle(userInfo.name, userInfo.email);
            if (result.success) {
              window.showToast(result.message, "success");
              setTimeout(() => {
                window.location.href = "index.html";
              }, 1000);
            } else {
              window.showToast(result.message || "Registration failed", "error");
            }
          })
          .catch(err => {
            window.showToast("Failed to fetch Google profile info", "error");
            console.error(err);
          });
        }
      },
      error_callback: (err) => {
        window.showToast("Google authorization failed", "error");
        console.error(err);
      }
    });
    
    client.requestAccessToken();
  } catch (e) {
    console.error("Failed to initialize Google login client: ", e);
    window.showToast("Could not start Google Sign-In. Please check console logs.", "error");
  }
};
