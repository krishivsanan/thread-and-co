/* ==========================================================================
   LOGIN / SIGNUP
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

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


    /* Check existing user */

    const users =
      JSON.parse(
        localStorage.getItem(
          "threadco_users"
        )
      ) || [];


    const existingUser =
      users.find(
        (user) =>
          user.email === email
      );


    if (existingUser) {

      showMessage(
        "An account with this email already exists.",
        "error"
      );

      return;
    }


    /* Create user */

    const newUser = {

      id: Date.now(),

      name,

      email,

      password

    };


    users.push(newUser);


    localStorage.setItem(
      "threadco_users",
      JSON.stringify(users)
    );


    /* Login user */

    localStorage.setItem(
      "threadco_current_user",
      JSON.stringify({

        id: newUser.id,

        name: newUser.name,

        email: newUser.email

      })
    );


    showMessage(
      `Welcome to Thread & Co., ${name}!`,
      "success"
    );


    signupForm.reset();


    /* Redirect after success */

    setTimeout(() => {

      window.location.href =
        "account.html";

    }, 1200);

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


    const users =
      JSON.parse(
        localStorage.getItem(
          "threadco_users"
        )
      ) || [];


    const user =
      users.find(
        (user) =>
          user.email === email &&
          user.password === password
      );


    if (!user) {

      showMessage(
        "Incorrect email or password.",
        "error"
      );

      return;
    }


    /* Save logged-in user */

    localStorage.setItem(
      "threadco_current_user",
      JSON.stringify({

        id: user.id,

        name: user.name,

        email: user.email

      })
    );


    showMessage(
      `Welcome back, ${user.name}!`,
      "success"
    );


    /* Redirect */

    setTimeout(() => {

      window.location.href =
        "account.html";

    }, 1000);

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