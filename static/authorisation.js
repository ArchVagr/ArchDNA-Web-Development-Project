const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const email = document.getElementById("email");
    const password = document.getElementById("password");

    if (!emailRegex.test(email.value)) {
        e.preventDefault();
        alert("Invalid email");
        return;
    }

    if (password.value.length < 8) {
        e.preventDefault();
        alert("Password must be longer than 8 symbols");
        return;
    }
});