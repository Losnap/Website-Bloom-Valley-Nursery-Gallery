document.addEventListener("DOMContentLoaded", () => {
    const subscribeButtons = document.querySelectorAll(".js-subscribe-btn");
    subscribeButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            alert("Thank you for subscribing.");
        });
    });

    const addToCartButtons = document.querySelectorAll(".js-add-cart");
    addToCartButtons.forEach((button) => {
        button.addEventListener("click", () => {
            alert("Item added to the cart.");
        });
    });

    const clearCartButton = document.querySelector(".js-clear-cart");
    if (clearCartButton) {
        clearCartButton.addEventListener("click", () => {
            alert("Cart cleared.");
        });
    }

    const processOrderButton = document.querySelector(".js-process-order");
    if (processOrderButton) {
        processOrderButton.addEventListener("click", () => {
            alert("Thank you for your order.");
        });
    }

    const contactSubmitButton = document.querySelector(".js-contact-submit");
    if (contactSubmitButton) {
        contactSubmitButton.addEventListener("click", (event) => {
            event.preventDefault();
            alert("Thank you for your message.");
        });
    }
});
