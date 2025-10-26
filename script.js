// --- FIX: Use explicit base URL for API calls to prevent network errors ---
const API_BASE_URL = 'https://movieloop-backend.onrender.com/api';

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
    if (!messageBox) return; 
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;
    messageBox.style.display = 'block';
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 5000);
}

// Check if critical data is missing (only relevant on seats.html)
if (document.title.includes("Select Seats")) {
    if (!username || !movieId || !movieName) {
        displayMessage("Booking session expired. Redirecting to movie selection.", 'error');
        setTimeout(() => { window.location.href = "movie.html"; }, 1500);
    }
}

// Update UI headers
if (movieTitleDisplay) movieTitleDisplay.textContent = movieName || "Select Your Seats";
if (maxSeatsDisplay) maxSeatsDisplay.textContent = availableSeats;
if (pricePerSeatDisplay) pricePerSeatDisplay.textContent = `(@ ₹${ticketPrice}/seat)`;


function updateSelectedCount() {
    if (!container || !count || !total || !seats) return;
    
    const selectedSeats = document.querySelectorAll(".row .seat.selected");
    const selectedSeatsCount = selectedSeats.length;
    
    // Client-side availability check
    if (selectedSeatsCount > availableSeats) {
        if (selectedSeats.length > 0) {
            // Deselect the last selected seat
            selectedSeats[selectedSeats.length - 1].classList.remove("selected");
            updateSelectedCount(); 
            displayMessage(`Cannot select more than ${availableSeats} seats!`, 'error');
            return;
        }
    }

    count.innerText = selectedSeatsCount;
    total.innerText = selectedSeatsCount * ticketPrice;
}

function populateUI() {
    // Left empty as seat state is not persisted in this version.
}

// Event listener for seat selection
if (container) {
  container.addEventListener("click", e => {
      if (e.target.classList.contains("seat") && !e.target.classList.contains("sold")) {
          e.target.classList.toggle("selected");
          updateSelectedCount();
      }
  });
}

// ✅ BOOK NOW BUTTON HANDLER (API call)
document.addEventListener('DOMContentLoaded', () => {
    const bookNowBtn = document.getElementById("book-now-btn");

    if (bookNowBtn) {
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
              const response = await fetch(`${API_BASE_URL}/book`, {
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
                  localStorage.setItem("selectedMovieName", data.movieTitle);
                  localStorage.setItem("selectedMoviePrice", data.moviePrice); 

                  // Generate dummy seat numbers for PDF ticket
                  let dummySeats = [];
                  for (let i = 1; i <= selectedSeatsCount; i++) {
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
              displayMessage('Network error. Could not complete booking. Check your terminal.', 'error');
              bookNowBtn.disabled = false;
              bookNowBtn.textContent = 'Book Now';
          }
      });
    }
});


populateUI();

updateSelectedCount();
