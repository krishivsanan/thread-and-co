/* ==========================================================================
   LOGIN / SIGNUP
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = window.THREADCO_API_BASE || "http://localhost:4000/api";

  const currentUser = JSON.parse(
    localStorage.getItem("threadco_current_user")
  );

  if (currentUser) {
    window.location.href = "account.html";
    return;
  }

  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  const switchButton = document.getElementById("switch-form-btn");
  const switchText = document.getElementById("switch-text");

  const formTitle = document.getElementById("form-title");
  const formSubtitle = document.getElementById("form-subtitle");

  const message = document.getElementById("account-message");

  let isLoginMode = true;


  /* ----------------------------------------------------------------------
     SWITCH LOGIN / SIGNUP
     ---------------------------------------------------------------------- */

  switchButton.addEventListener("click", () => {

    isLoginMode = !isLoginMode;

    message.textContent = "";

    if (isLoginMode) {

      loginForm.hidden = false;
      signupForm.hidden = true;

      formTitle.textContent = "Sign in";

      formSubtitle.textContent =
        "Enter your details to continue shopping.";

      switchText.textContent =
        "New to Thread & Co.?";

      switchButton.textContent =
        "Create an account";

    } else {

      loginForm.hidden = true;
      signupForm.hidden = false;

      formTitle.textContent =
        "Create account";

      formSubtitle.textContent =
        "Join Thread & Co. and make shopping easier.";

      switchText.textContent =
        "Already have an account?";

      switchButton.textContent =
        "Sign in";
    }

  });


  /* ----------------------------------------------------------------------
     SHOW / HIDE PASSWORD
     ---------------------------------------------------------------------- */

  const passwordButtons =
    document.querySelectorAll(".toggle-password");


  passwordButtons.forEach((button) => {

    button.addEventListener("click", () => {

      const targetId =
        button.dataset.target;

      const input =
        document.getElementById(targetId);


      if (!input) return;


      if (input.type === "password") {

        input.type = "text";

        button.textContent = "Hide";

        button.setAttribute(
          "aria-label",
          "Hide password"
        );

      } else {

        input.type = "password";

        button.textContent = "Show";

        button.setAttribute(
          "aria-label",
          "Show password"
        );
      }

    });

  });


    /* ----------------------------------------------------------------------
     SIGN UP
     ---------------------------------------------------------------------- */

  signupForm.addEventListener("submit", (event) => {

    event.preventDefault();


    const name =
      document
        .getElementById("signup-name")
        .value
        .trim();


    const email =
      document
        .getElementById("signup-email")
        .value
        .trim()
        .toLowerCase();


    const password =
      document
        .getElementById("signup-password")
        .value;


    const confirmPassword =
      document
        .getElementById("confirm-password")
        .value;


    /* Password check */

    if (password !== confirmPassword) {

      showMessage(
        "Passwords do not match.",
        "error"
      );

      return;
    }


    if (password.length < 6) {

      showMessage(
        "Password must be at least 6 characters.",
        "error"
      );

      return;
    }


    /* Create account via the API */

    const submitButton =
      signupForm.querySelector("button[type='submit']");

    if (submitButton) {
      submitButton.disabled = true;
    }


    fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        password
      }),
    })
      .then(async (res) => {

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || "Something went wrong."
          );
        }

        return data;

      })
      .then(({ token, user }) => {

        localStorage.setItem(
          "threadco_token",
          token
        );

        localStorage.setItem(
          "threadco_current_user",
          JSON.stringify(user)
        );


        showMessage(
          `Welcome to Thread & Co., ${user.name}!`,
          "success"
        );


        signupForm.reset();


        setTimeout(() => {

          window.location.href =
            "account.html";

        }, 1200);

      })
      .catch((err) => {

        showMessage(
          err.message,
          "error"
        );

      })
      .finally(() => {

        if (submitButton) {
          submitButton.disabled = false;
        }

      });

  });
  


    /* ----------------------------------------------------------------------
     LOGIN
     ---------------------------------------------------------------------- */

  loginForm.addEventListener("submit", (event) => {

    event.preventDefault();


    const email =
      document
        .getElementById("login-email")
        .value
        .trim()
        .toLowerCase();


    const password =
      document
        .getElementById("login-password")
        .value;


    /* Log in via the API */

    const submitButton =
      loginForm.querySelector("button[type='submit']");

    if (submitButton) {
      submitButton.disabled = true;
    }


    fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      }),
    })
      .then(async (res) => {

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error ||
            "Incorrect email or password."
          );
        }

        return data;

      })
      .then(({ token, user }) => {

        localStorage.setItem(
          "threadco_token",
          token
        );

        localStorage.setItem(
          "threadco_current_user",
          JSON.stringify(user)
        );


        showMessage(
          `Welcome back, ${user.name}!`,
          "success"
        );


        setTimeout(() => {

          window.location.href =
            "account.html";

        }, 1000);

      })
      .catch((err) => {

        showMessage(
          err.message,
          "error"
        );

      })
      .finally(() => {

        if (submitButton) {
          submitButton.disabled = false;
        }

      });

  });


  /* ----------------------------------------------------------------------
     FORGOT PASSWORD
     ---------------------------------------------------------------------- */

  const forgotPassword =
    document.querySelector(
      ".forgot-password"
    );


  if (forgotPassword) {

    forgotPassword.addEventListener(
      "click",
      (event) => {

        event.preventDefault();

        showMessage(
          "Password reset is not available in this demo yet.",
          "error"
        );

      }
    );

  }


  /* ----------------------------------------------------------------------
     MESSAGE FUNCTION
     ---------------------------------------------------------------------- */

  function showMessage(text, type) {

    message.textContent = text;


    if (type === "success") {

      message.style.color =
        "#2f7d32";

    } else {

      message.style.color =
        "var(--color-brick)";
    }

  }

});