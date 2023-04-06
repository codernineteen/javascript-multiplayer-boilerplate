const googleSignIn = async () => {
  await import("https://accounts.google.com/gsi/client");
  const loginBtn = document.getElementById("buttonDiv");
  const loginPath = document.getElementById("login-path");

  function handleCredentialResponse(response) {
    const encoded = response.credential;
    localStorage.setItem("jwtToken", encoded);
    loginBtn.hidden = true;
  }

  function popUpLogin() {
    google.accounts.id.initialize({
      client_id:
        "1069479751075-lv1qokuucjt999m0n46sh5cvhp3lhl5l.apps.googleusercontent.com",
      callback: handleCredentialResponse,
    });
    google.accounts.id.renderButton(
      document.getElementById("buttonDiv"),
      { theme: "outline", size: "large" } // customization attributes
    );
    google.accounts.id.prompt(); // also display the One Tap dialog
  }

  loginPath.addEventListener("click", () => {
    popUpLogin();
  });
};

googleSignIn();
