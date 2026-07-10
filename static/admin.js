const addpop_form = document.getElementById("addpop_form");
const addpop_inputs = document.querySelectorAll(".add_pop");

addpop_form.addEventListener("submit", (e) => {
    
    addpop_inputs.forEach((input) => {
        input.value = "";
    });
});