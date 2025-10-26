const container = document.querySelector(".container");
const seats = document.querySelectorAll(".row .seat:not(.sold)");
const count = document.getElementById("count");
const total = document.getElementById("total");
const movieTitleDisplay = document.getElementById("movieTitleDisplay");
const maxSeatsDisplay = document.getElementById("maxSeatsDisplay");
const pricePerSeatDisplay = document.getElementById("pricePerSeat");
const messageBox = document.getElementById("messageBox");

// Get movie data from localStorage
const username = localStorage.getItem("username");
const movieId = localStorage.getItem("selectedMovieId");
const movieName = localStorage.getItem("selectedMovieName");
let ticketPrice = parseInt(localStorage.getItem("selectedMoviePrice")) || 0;
let availableSeats = parseInt(localStorage.getItem("availableSeats")) || 0;


// Utility to display messages
function displayMessage(message, type = 'success') {
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;
    messageBox.style.display = 'block';
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 5000);
}

// Check if critical data is missing
if (!username || !movieId || !movieName) {
    displayMessage("Booking session expired. Redirecting to movie selection.", 'error');
    // We don't use early return here, but redirect after a short delay
    setTimeout(() => { window.location.href = "movie.html"; }, 1500);
}

// Update UI headers
movieTitleDisplay.textContent = movieName || "Select Your Seats";
maxSeatsDisplay.textContent = availableSeats;
pricePerSeatDisplay.textContent = `(@ ₹${ticketPrice}/seat)`;


function updateSelectedCount() {
    const selectedSeats = document.querySelectorAll(".row .seat.selected");
    const selectedSeatsCount = selectedSeats.length;
    
    // Client-side availability check
    if (selectedSeatsCount > availableSeats) {
        // Find the last seat and deselect it to enforce the limit
        if (selectedSeats.length > 0) {
            selectedSeats[selectedSeats.length - 1].classList.remove("selected");
            // Rerun the function with the corrected selection
            updateSelectedCount();
            displayMessage(`Cannot select more than ${availableSeats} seats!`, 'error');
            return;
        }
    }

    count.innerText = selectedSeatsCount;
    total.innerText = selectedSeatsCount * ticketPrice;
}

function populateUI() {
    // Only used to call updateSelectedCount() once on load to initialize totals
}

container.addEventListener("click", e => {
    if (e.target.classList.contains("seat") && !e.target.classList.contains("sold")) {
        e.target.classList.toggle("selected");
        updateSelectedCount();
    }
});

// ✅ BOOK NOW BUTTON HANDLER (API call)
document.addEventListener('DOMContentLoaded', () => {
    const bookNowBtn = document.getElementById("book-now-btn");

    bookNowBtn.addEventListener('click', async () => {
        const selectedSeatsCount = parseInt(count.innerText, 10);

        if (selectedSeatsCount === 0) {
            displayMessage('Please select at least one seat.', 'error');
            return;
        }

        // Disable button and show loading state
        bookNowBtn.disabled = true;
        bookNowBtn.textContent = 'Processing...';

        try {
            const response = await fetch('/api/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    movieId,
                    seats: selectedSeatsCount
                })
            });

            const data = await response.json();

            if (response.ok) {
                // SUCCESS: Store booking details from API response
                localStorage.setItem("bookingId", data.bookingId);
                localStorage.setItem("confSeats", data.seatsBooked);
                localStorage.setItem("confTotal", data.moviePrice * data.seatsBooked);
                
                // Set the price-per-seat and movie name again for the confirmation page
                localStorage.setItem("selectedMovieName", data.movieTitle);
                localStorage.setItem("selectedMoviePrice", data.moviePrice); 

                // For the confirmation page's PDF generator, generate dummy seat numbers
                let dummySeats = [];
                for (let i = 1; i <= selectedSeatsCount; i++) {
                    // Generate a simple seat number (e.g., A1, A2, B1)
                    const row = String.fromCharCode(65 + Math.floor((i - 1) / 8)); 
                    const seatNum = (i % 8) === 0 ? 8 : (i % 8);
                    dummySeats.push(`${row}${seatNum}`);
                }
                localStorage.setItem("selectedSeats", JSON.stringify(dummySeats));

                window.location.href = "confirm.html";
            } else {
                // FAILURE: Display error message
                displayMessage(data.message || 'Booking failed. Please try again.', 'error');
                bookNowBtn.disabled = false;
                bookNowBtn.textContent = 'Book Now';
            }
        } catch (error) {
            console.error('Booking network error:', error);
            displayMessage('Network error. Could not complete booking.', 'error');
            bookNowBtn.disabled = false;
            bookNowBtn.textContent = 'Book Now';
        }
    });
});


populateUI();
updateSelectedCount();
