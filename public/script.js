document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  const chatBox = document.getElementById('chat-box');
  const userInput = document.getElementById('user-input');
  const modelSelect = document.getElementById('model-select');
  const menuBtn = document.getElementById('menu-btn');
  const menuDropdown = document.getElementById('menu-dropdown');
  const clearChatBtn = document.getElementById('clear-chat-btn');

  if (!form || !chatBox || !userInput) return;

  // Toggle Menu
  menuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    menuDropdown?.classList.toggle('hidden');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (menuDropdown && !menuDropdown.classList.contains('hidden') && !menuBtn?.contains(e.target)) {
      menuDropdown.classList.add('hidden');
    }
  });

  // Clear Chat
  clearChatBtn?.addEventListener('click', () => {
    // Keep the welcome message if you want, or remove everything.
    // Let's remove everything except the very first welcome message if it exists, 
    // or just clear the chat box container content but keep the structure.
    // Simpler: clear all children of chatBox.
    chatBox.innerHTML = '';
    
    // Optional: Restore welcome message
    const welcomeHTML = `
      <div class="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div class="flex flex-col gap-1 max-w-[85%]">
          <span class="text-xs text-gray-500 ml-1 font-medium">Gemini</span>
          <div class="bg-white p-3.5 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm text-sm text-gray-700 leading-relaxed">
            Conversation cleared. Ready for a new topic!
          </div>
        </div>
      </div>
    `;
    chatBox.innerHTML = welcomeHTML;
    
    menuDropdown?.classList.add('hidden');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    userInput.value = '';
    userInput.focus();

    const loadingDots = '<div class="flex gap-1 h-3 items-center"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>';
    const botMessageElement = addMessage(loadingDots, 'bot');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: [{ role: 'user', text: message }],
          model: modelSelect?.value
        })
      });

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
            const errorData = await response.json();
            if (errorData.error) {
                errorMessage = errorData.error;
                
                // Check if the error message is actually a stringified JSON (nested error)
                if (typeof errorMessage === 'string' && errorMessage.trim().startsWith('{')) {
                    try {
                        const innerError = JSON.parse(errorMessage);
                        // Extract the actual message from the inner object structure
                        if (innerError.error?.message) {
                            errorMessage = innerError.error.message;
                        } else if (innerError.message) {
                            errorMessage = innerError.message;
                        }
                        
                        // Truncate message to remove technical details (stop at first newline)
                        if (errorMessage.includes('\n')) {
                            errorMessage = errorMessage.split('\n')[0];
                        }
                    } catch (e) {
                        // Not a JSON string, keep original message
                    }
                }
            }
        } catch (e) {
            // parsing failed, stick to status code
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const resultText = typeof data?.result === 'string' ? data.result.trim() : '';

      if (resultText) {
        // Parse Markdown
        botMessageElement.innerHTML = marked.parse(resultText);
      } else {
        botMessageElement.textContent = 'Sorry, no response received.';
        showToast('Empty response from server', 'warning');
      }
    } catch (error) {
      console.error('Error fetching chat response:', error);
      botMessageElement.textContent = 'Failed to get response from server.';
      showToast(error.message || 'Failed to connect to server', 'error');
    } finally {
      scrollToBottom(chatBox);
    }
  });

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    
    // Colors based on type
    const colors = {
      success: 'bg-green-500 border-green-600',
      error: 'bg-red-500 border-red-600',
      warning: 'bg-yellow-500 border-yellow-600',
      info: 'bg-blue-500 border-blue-600'
    };
    
    const bgClass = colors[type] || colors.info;

    toast.className = `${bgClass} text-white px-4 py-3 rounded-lg shadow-lg border flex items-center gap-3 min-w-[300px] max-w-md toast-enter`;
    
    // Icon based on type
    let icon = '';
    if (type === 'error') {
      icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    } else if (type === 'success') {
      icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`;
    } else {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    }

    toast.innerHTML = `
      ${icon}
      <span class="font-medium text-sm flex-1">${message}</span>
      <button class="ml-2 hover:bg-white/20 p-1 rounded-full transition-colors" onclick="this.parentElement.remove()">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L10 8.586 5.707 4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    `;

    container.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-exit');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 3000);
  }

  function addMessage(text, sender) {
    const messageWrapper = document.createElement('div');
    messageWrapper.className = 'flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300';
    
    if (sender === 'user') {
      messageWrapper.className += ' flex-row-reverse';
      messageWrapper.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div class="flex flex-col gap-1 items-end max-w-[85%]">
          <div class="bg-indigo-600 p-3.5 rounded-2xl rounded-tr-none shadow-md text-sm text-white leading-relaxed">
            ${text}
          </div>
        </div>
      `;
    } else {
      // Bot message
      messageWrapper.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div class="flex flex-col gap-1 max-w-[85%]">
          <span class="text-xs text-gray-500 ml-1 font-medium">Gemini</span>
          <div class="bg-white p-3.5 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm text-sm text-gray-700 leading-relaxed prose">
            ${text}
          </div>
        </div>
      `;
    }

    chatBox.appendChild(messageWrapper);
    scrollToBottom(chatBox);
    
    // Return the text container element so we can update it later (for the bot "Thinking..." state)
    // For bot, it is the last div inside the wrapper's last child
    if (sender === 'bot') {
        return messageWrapper.querySelector('.bg-white');
    }
    return messageWrapper;
  }

  function scrollToBottom(container) {
    container.scrollTop = container.scrollHeight;
  }
});
