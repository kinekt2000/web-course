const signUpButton = document.getElementById('sign-up');
const signInButton = document.getElementById('sign-in');
const container = document.getElementById('global-container');

document.querySelectorAll("[data-modal-target]").forEach((button)=>{
    button.addEventListener("click", () => {
        switch (button.dataset.modalType) {
            case "sign-up":
                container.classList.add("right-panel-active");
                break;
            case "sign-in":
                container.classList.remove("right-panel-active");
                break;
            default:
                break;
        }
    });
})

signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});


function checkPassword() {
    const pass = document.getElementById("pass");
    const cpass = document.getElementById("cpass");

    if(pass.value === cpass.value) {
        cpass.setCustomValidity("");
    } else {
        cpass.setCustomValidity("Do not match");
    }
}