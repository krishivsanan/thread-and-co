/* ==========================================================================
   LOGIN / SIGNUP / FORGOT PASSWORD
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = (window.THREADCO_API_BASE || "http://localhost:4000/api").replace(/\/$/, "");

  const currentUser = JSON.parse(
    localStorage.getItem("threadco_current_user")
  );

  if (currentUser) {
    window.location.href = "account.html";
    return;
  }

  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const forgotForm = document.getElementById("forgot-form");

  const switchButton = document.getElementById("switch-form-btn");
  const switchText = document.getElementById("switch-text");

  const formEyebrow = document.getElementById("form-eyebrow");
  const formTitle = document.getElementById("form-title");
  const formSubtitle = document.getElementById("form-subtitle");

  const message = document.getElementById("account-message");

  let currentMode = "login"; // "login" | "signup" | "forgot"

  function setMode(mode) {
    currentMode = mode;
    message.textContent = "";

    if (mode === "login") {
      loginForm.hidden = false;
      signupForm.hidden = true;
      if (forgotForm) forgotForm.hidden = true;

      if (formEyebrow) formEyebrow.textContent = "WELCOME BACK";
      formTitle.textContent = "Sign in";
      formSubtitle.textContent = "Enter your details to continue shopping.";

      switchText.textContent = "New to Thread & Co.?";
      switchButton.textContent = "Create an account";
    } else if (mode === "signup") {
      loginForm.hidden = true;
      signupForm.hidden = false;
      if (forgotForm) forgotForm.hidden = true;

      if (formEyebrow) formEyebrow.textContent = "JOIN US";
      formTitle.textContent = "Create account";
      formSubtitle.textContent = "Join Thread & Co. and make shopping easier.";

      switchText.textContent = "Already have an account?";
      switchButton.textContent = "Sign in";
    } else if (mode === "forgot") {
      loginForm.hidden = true;
      signupForm.hidden = true;
      if (forgotForm) forgotForm.hidden = false;

      if (formEyebrow) formEyebrow.textContent = "ACCOUNT RECOVERY";
      formTitle.textContent = "Reset password";
      formSubtitle.textContent = "Enter your registered email and choose a new password.";

      switchText.textContent = "Remember your password?";
      switchButton.textContent = "Back to sign in";

      // Pre-fill email from login input if already typed
      const loginEmailInput = document.getElementById("login-email");
      const forgotEmailInput = document.getElementById("forgot-email");
      if (loginEmailInput && forgotEmailInput && loginEmailInput.value) {
        forgotEmailInput.value = loginEmailInput.value;
      }
    }
  }

  /* ----------------------------------------------------------------------
     SWITCH BUTTON (LOGIN / SIGNUP / BACK TO LOGIN)
     ---------------------------------------------------------------------- */

  switchButton.addEventListener("click", () => {
    if (currentMode === "login") {
      setMode("signup");
    } else {
      setMode("login");
    }
  });

  /* ----------------------------------------------------------------------
     FORGOT PASSWORD LINK CLICK
     ---------------------------------------------------------------------- */

  const forgotPasswordLink = document.querySelector(".forgot-password");

  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (event) => {
      event.preventDefault();
      setMode("forgot");
    });
  }

  /* ----------------------------------------------------------------------
     SHOW / HIDE PASSWORD TOGGLES
     ---------------------------------------------------------------------- */

  const passwordButtons = document.querySelectorAll(".toggle-password");

  passwordButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.target;
      const input = document.getElementById(targetId);

      if (!input) return;

      if (input.type === "password") {
        input.type = "text";
        button.textContent = "Hide";
        button.setAttribute("aria-label", "Hide password");
      } else {
        input.type = "password";
        button.textContent = "Show";
        button.setAttribute("aria-label", "Show password");
      }
    });
  });

  /* ----------------------------------------------------------------------
     SIGN UP
     ---------------------------------------------------------------------- */

  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim().toLowerCase();
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (password !== confirmPassword) {
      showMessage("Passwords do not match.", "error");
      return;
    }

    if (password.length < 6) {
      showMessage("Password must be at least 6 characters.", "error");
      return;
    }

    const submitButton = signupForm.querySelector("button[type='submit']");
    if (submitButton) submitButton.disabled = true;

    fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, password }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong.");
        }
        return data;
      })
      .then(({ token, user }) => {
        localStorage.setItem("threadco_token", token);
        localStorage.setItem("threadco_current_user", JSON.stringify(user));

        showMessage(`Welcome to Thread & Co., ${user.name}!`, "success");
        signupForm.reset();

        setTimeout(() => {
          window.location.href = "account.html";
        }, 1200);
      })
      .catch((err) => {
        showMessage(err.message, "error");
      })
      .finally(() => {
        if (submitButton) submitButton.disabled = false;
      });
  });

  /* ----------------------------------------------------------------------
     LOGIN
     ---------------------------------------------------------------------- */

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;

    const submitButton = loginForm.querySelector("button[type='submit']");
    if (submitButton) submitButton.disabled = true;

    fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Incorrect email or password.");
        }
        return data;
      })
      .then(({ token, user }) => {
        localStorage.setItem("threadco_token", token);
        localStorage.setItem("threadco_current_user", JSON.stringify(user));

        showMessage(`Welcome back, ${user.name}!`, "success");

        setTimeout(() => {
          window.location.href = "account.html";
        }, 1000);
      })
      .catch((err) => {
        showMessage(err.message, "error");
      })
      .finally(() => {
        if (submitButton) submitButton.disabled = false;
      });
  });

  /* ----------------------------------------------------------------------
     FORGOT PASSWORD SUBMIT
     ---------------------------------------------------------------------- */

  if (forgotForm) {
    forgotForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const email = document.getElementById("forgot-email").value.trim().toLowerCase();
      const newPassword = document.getElementById("forgot-new-password").value;
      const confirmPassword = document.getElementById("forgot-confirm-password").value;

      if (newPassword !== confirmPassword) {
        showMessage("New passwords do not match. Please verify.", "error");
        return;
      }

      if (newPassword.length < 6) {
        showMessage("New password must be at least 6 characters.", "error");
        return;
      }

      const submitButton = document.getElementById("forgot-submit-btn");
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Updating...";
      }

      fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          newPassword
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "Unable to reset password.");
          }
          return data;
        })
        .then((data) => {
          showMessage(data.message || "Password reset successfully! Please sign in.", "success");

          // Reset inputs
          document.getElementById("forgot-new-password").value = "";
          document.getElementById("forgot-confirm-password").value = "";

          // Switch back to login form after 1.5s
          setTimeout(() => {
            setMode("login");
            const loginEmailInput = document.getElementById("login-email");
            if (loginEmailInput) {
              loginEmailInput.value = email;
              const loginPassInput = document.getElementById("login-password");
              if (loginPassInput) loginPassInput.focus();
            }
          }, 1500);
        })
        .catch((err) => {
          showMessage(err.message, "error");
        })
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Reset Password";
          }
        });
    });
  }

  /* ----------------------------------------------------------------------
     MESSAGE FUNCTION
     ---------------------------------------------------------------------- */

  function showMessage(text, type) {
    message.textContent = text;

    if (type === "success") {
      message.style.color = "#2f7d32";
    } else {
      message.style.color = "var(--color-brick)";
    }
  }
});
