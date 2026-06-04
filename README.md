# Gulf Zone Admin & Dynamic Website

A full-stack Node.js application featuring a dynamic corporate website for Gulf Zone and a custom-built administrative dashboard for content management.

## 🚀 Features

* **Dynamic Content Management**: Update Hero sections, contact information, and global site settings without touching the code.
* **Service Portfolio Manager**: Add, update, or delete services with image upload support.
* **Smart Image Cleanup**: Automated system that purges unused uploaded images while protecting default template assets.
* **One-Step Undo/Restore**: Data management system that allows administrators to undo the last change or restore defaults from backup JSON files.
* **Secure Authentication**: Admin panel protected by session-based authentication and environment-variable credentials.
* **Automated Email Inquiries**: Frontend contact forms integrated with a backend Nodemailer service for reliable lead generation.
* **Dockerized Environment**: Ready for containerized deployment with persisted data volumes.

## 🛠️ Tech Stack

* **Backend**: Node.js, Express.js
* **Frontend**: EJS (Templating), Bootstrap 5, GSAP (Animations), AOS
* **Database**: Flat-file JSON (for high-speed portability and easy backups)
* **Infrastructure**: Docker, Docker Compose
* **Email**: Nodemailer

## 📋 Prerequisites

* Node.js (v18 or higher)
* npm
* Docker & Docker Compose (optional for containerized setup)

## ⚙️ Environment Configuration

Create a `.env` file in the root directory and configure the following variables:

```env
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
SESSION_SECRET=your_random_secret_string

# Nodemailer Settings (Gmail Example)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

📦 Installation & Setup
Standard Installation
Clone the repository and navigate to the project folder.

Install dependencies:

Bash
npm install
Start the server:

Bash
npm start
Docker Setup
To run the application in a fully isolated container:

Bash
docker-compose up --build -d
📂 Project Structure
/data: Contains content.json and services.json (Primary data stores) along with .bak and .default.json files for the restore/undo system.

/public: Static frontend assets, including images, CSS, and client-side JavaScript.

/public/assets/images/uploads: Directory where all admin-uploaded service images are stored.

/views: EJS templates for the admin dashboard and layouts.

server.js: Core application logic, API routes, and smart cleanup helpers.

🧹 Maintenance & Cleanup Logic
The system includes a Smart Cleanup helper in writeJSON. To ensure the Undo button works correctly, deleting a service removes its record from the live JSON but keeps the physical image file. The file is only permanently deleted when a new action is taken, ensuring that "Undo" can always restore a complete state including images.

📧 Contact Form Integration
The contact forms on index.html and contacts.html send data to the /api/send-email endpoint. This endpoint uses Nodemailer to format and send inquiries directly to the configured EMAIL_USER.