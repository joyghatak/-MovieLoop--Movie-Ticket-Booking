# 🎬 MovieLoop - Movie Ticket Booking System

A simple, clean, and interactive front-end web application for booking movie tickets. This project allows users to select a movie, choose their seats from an interactive layout, and get a confirmation with a downloadable PDF ticket.

**Live Demo:** [Link to your live project on GitHub Pages or Netlify]

---

### 🍿 Features

* **User Login:** Simple login page to capture user name and email.
* **Movie Selection:** A comprehensive list of movies categorized by genre.
* **Interactive Seat Selector:** A visually appealing seat map where users can select or deselect available seats.
* **Real-time Price Calculation:** The total price updates instantly as seats are selected.
* **Persistent State:** Uses `localStorage` to remember user details, movie choice, and selected seats between pages.
* **Booking Confirmation:** A final summary page displays all booking details.
* **PDF Ticket Download:** Users can download their ticket as a well-formatted PDF file, generated using the jsPDF library.

---

### 🛠️ Technology Stack

* **HTML5:** For the structure and content of the web pages.
* **CSS3:** For styling, including Flexbox for layout and custom properties for a modern look.
* **JavaScript (ES6+):** For all the client-side logic, interactivity, and state management.
* **Browser `localStorage`:** To persist data across different pages without a backend.
* **jsPDF Library:** An external library used to generate the PDF ticket on the client-side.

---


### 📂 Project Structure

├── index.html       # Login page
├── movie.html       # Movie selection page
├── seats.html       # Seat selection page
├── confirm.html     # Booking confirmation page
├── style.css        # Shared stylesheet for all pages
└── script.js        # JavaScript for the seat selection logic
