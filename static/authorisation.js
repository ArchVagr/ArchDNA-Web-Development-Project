const form = document.querySelector("form");

const signup = document.getElementById('choice_button1')
const login = document.getElementById('choice_button2')
const title = document.getElementById('form_title')
const button = document.getElementById('signlog_button')

signup.addEventListener('click',(e)=>{
    e.preventDefault()
    login.classList.remove("choosed")
    signup.classList.add("choosed")

    form.action='/archdna/signup'
    title.innerText='Sign Up'
    button.innerText='Sign Up'
})

login.addEventListener('click',(e)=>{
    e.preventDefault()
    signup.classList.remove("choosed")
    login.classList.add("choosed")

    form.action='/archdna/login'
    title.innerText='Log In'
    button.innerText='Log In'
})

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