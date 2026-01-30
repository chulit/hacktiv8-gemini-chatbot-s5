# Gemini AI Chatbot

## Project Overview
This project is a modern, full-stack chatbot application that interfaces with the Google Gemini API. It features a polished, responsive user interface built with Tailwind CSS and a lightweight Node.js/Express backend. The application is designed to be simple to set up and extensible.

### Tech Stack
- **Frontend:**
  - **HTML5:** Semantic structure.
  - **Tailwind CSS (CDN):** Utility-first styling for a modern, responsive design.
  - **JavaScript (Vanilla):** Client-side logic for API communication, UI updates, and event handling.
  - **Marked.js (CDN):** Renders Markdown responses from the bot into rich HTML.
  - **Inter Font:** Google Fonts integration for typography.
- **Backend:**
  - **Node.js & Express:** Serves the static frontend and acts as a proxy to the Gemini API.
  - **@google/genai:** Official SDK for interacting with Google's generative AI models.
  - **dotenv:** Environment variable management.
  - **cors:** Cross-Origin Resource Sharing support.

## Architecture
- **`index.js`:** The main server entry point. It handles API requests (`/api/chat`), validates input, manages model selection, and communicates with Google's Gemini API.
- **`public/`:** Contains all client-side assets served statically by Express.
  - **`index.html`:** The main UI layout, including the chat container, header with model selector, and input area.
  - **`script.js`:** Handles form submissions, manages the chat history in the DOM, implements the "Thinking..." state, handles error toasts, and processes Markdown.
  - **`style.css`:** Custom styles for scrollbars, Markdown formatting (`.prose`), and toast animations that go beyond Tailwind's utilities.

## Features
- **Real-time Chat:** Interactive chat interface with a "typing" indicator.
- **Model Selection:** Users can switch between available models (e.g., Gemini 2.5 Flash, Gemini 2.0 Flash) directly from the UI header.
- **Markdown Support:** Bot responses are parsed and rendered as rich HTML (lists, code blocks, bold text).
- **Error Handling:** Graceful error management with auto-dismissing toast notifications.
  - handles nested JSON error messages from the API.
  - Sanitizes user-facing error messages to be friendly while preserving technical details in toasts.
- **Conversation Management:** "Clear Conversation" option in the settings menu.
- **Responsive Design:** Fully responsive layout that works on desktop and mobile devices.

## Building and Running

### Prerequisites
- Node.js (v18+ recommended)
- A Google Gemini API Key

### Setup
1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Environment Configuration:**
    Create a `.env` file in the root directory (copy from `.env.example` if available) and add your API key:
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    GEMINI_MODEL=gemini-2.5-flash
    PORT=3000
    ```

### Running the Application
1.  **Start the Server:**
    ```bash
    npm start
    ```
2.  **Access the App:**
    Open your browser and navigate to `http://localhost:3000`.

## Development Conventions
- **Styling:** Use Tailwind utility classes directly in HTML for layout and spacing. Use `style.css` only for pseudo-elements (scrollbars), animations, or complex component styles (Markdown prose).
- **Error Handling:**
  - Backend: Catch errors and return a JSON object `{ error: message }`.
  - Frontend: Catch fetch errors, parse JSON details if available, and display them via `showToast()`. Keep the chat bubble message friendly.
- **API Communication:** All chat requests go to `/api/chat`. The payload must include `conversation` (array of messages) and optionally `model`.
