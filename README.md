# Gemini AI Chatbot

A modern, lightweight chatbot application that interfaces with the Google Gemini API. Built with Node.js, Express, and a vanilla JavaScript frontend styled with Tailwind CSS.

![Gemini Chatbot UI](https://via.placeholder.com/800x450?text=Gemini+Chatbot+Preview) 
*(Replace with actual screenshot if available)*

## Features

*   **⚡ Real-time Interaction:** Fast and responsive chat interface with a "typing" indicator.
*   **🤖 Multi-Model Support:** Switch between **Gemini 2.5 Flash** and **Gemini 2.0 Flash** directly from the UI.
*   **🌓 Dark/Light Mode:** Built-in theme toggle with persistent preference saving.
*   **📝 Markdown Rendering:** Rich text support for code blocks, lists, and formatting in bot responses (via Marked.js).
*   **📱 Fully Responsive:** Optimized layout for both desktop and mobile devices.
*   **🔔 Smart Error Handling:** Graceful error messages via toast notifications (e.g., quota limits, connection issues) while keeping the chat clean.
*   **🧹 Conversation Control:** Easily clear chat history to start fresh.

## Tech Stack

*   **Frontend:** HTML5, Tailwind CSS (CDN), Vanilla JavaScript, Marked.js.
*   **Backend:** Node.js, Express.js.
*   **AI Integration:** Google GenAI SDK (`@google/genai`).

## Prerequisites

*   Node.js (v18 or higher)
*   A Google Cloud Project with the **Gemini API** enabled.
*   An API Key from [Google AI Studio](https://aistudio.google.com/).

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/gemini-chatbot.git
cd gemini-chatbot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Open `.env` and add your configuration:

```env
GEMINI_API_KEY=your_actual_api_key_here
GEMINI_MODEL=gemini-2.5-flash
PORT=3000
```

### 4. Run the Application

Start the server:

```bash
npm start
```

Open your browser and navigate to:
`http://localhost:3000`

## Project Structure

```
├── index.js           # Express server & API proxy
├── public/            # Static frontend files
│   ├── index.html     # Main UI structure
│   ├── script.js      # Frontend logic (Chat, API calls, UI events)
│   └── style.css      # Custom styles (Scrollbars, Markdown prose, Animations)
├── .env.example       # Environment variable template
└── package.json       # Dependencies and scripts
```

## Contributing

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## License

This project is licensed under the ISC License.
