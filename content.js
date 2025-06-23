let questionElement = null;
let hideTimeout = null;
let currentQuestion = null;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showQuestion') {
    showQuestion(request.question);
  }
});

function showQuestion(question) {
  // Remove existing question if any
  hideQuestion();
  
  currentQuestion = question;

  // Create question element
  questionElement = document.createElement('div');
  questionElement.className = 'oop-quiz-question';
  
  // Create question content
  const questionContent = `
    <div class="question-header">
      <h3>OOP Quiz</h3>
      <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
    <div class="question-text">${question.question}</div>
    <div class="options">
      ${question.options.map((option, index) => `
        <button class="option-btn" data-index="${index}">${option}</button>
      `).join('')}
    </div>
    <div class="result" style="display: none;"></div>
  `;
  
  questionElement.innerHTML = questionContent;
  
  // Add styles
  questionElement.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(147, 51, 234, 0.95));
    color: white;
    padding: 20px;
    border-radius: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    z-index: 10000;
    max-width: 400px;
    min-width: 350px;
    animation: slideInFade 0.6s ease-out;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1);
  `;

  // Add animation keyframes if not already added
  if (!document.querySelector('#oop-quiz-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'oop-quiz-styles';
    styleSheet.textContent = `
      @keyframes slideInFade {
        from {
          opacity: 0;
          transform: translateX(100px) scale(0.9);
        }
        to {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
      }
      
      @keyframes slideOutFade {
        from {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
        to {
          opacity: 0;
          transform: translateX(100px) scale(0.9);
        }
      }
      
      .oop-quiz-question.hide {
        animation: slideOutFade 0.4s ease-in forwards;
      }
      
      .oop-quiz-question .question-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .oop-quiz-question .question-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
      
      .oop-quiz-question .close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background 0.2s;
      }
      
      .oop-quiz-question .close-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .oop-quiz-question .question-text {
        font-weight: 500;
        margin-bottom: 16px;
        line-height: 1.4;
      }
      
      .oop-quiz-question .options {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .oop-quiz-question .option-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        text-align: left;
        font-size: 13px;
        line-height: 1.3;
      }
      
      .oop-quiz-question .option-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-1px);
      }
      
      .oop-quiz-question .option-btn.correct {
        background: rgba(34, 197, 94, 0.3);
        border-color: rgba(34, 197, 94, 0.5);
      }
      
      .oop-quiz-question .option-btn.incorrect {
        background: rgba(239, 68, 68, 0.3);
        border-color: rgba(239, 68, 68, 0.5);
      }
      
      .oop-quiz-question .option-btn:disabled {
        cursor: not-allowed;
        opacity: 0.7;
      }
      
      .oop-quiz-question .result {
        margin-top: 16px;
        padding: 12px;
        border-radius: 8px;
        font-weight: 500;
        text-align: center;
      }
      
      .oop-quiz-question .result.correct {
        background: rgba(34, 197, 94, 0.2);
        border: 1px solid rgba(34, 197, 94, 0.3);
      }
      
      .oop-quiz-question .result.incorrect {
        background: rgba(239, 68, 68, 0.2);
        border: 1px solid rgba(239, 68, 68, 0.3);
      }
    `;
    document.head.appendChild(styleSheet);
  }

  // Add to page
  document.body.appendChild(questionElement);

  // Add option click handlers
  const optionButtons = questionElement.querySelectorAll('.option-btn');
  optionButtons.forEach(btn => {
    btn.addEventListener('click', () => handleOptionClick(btn));
  });

  // Auto-hide after 15 seconds
  hideTimeout = setTimeout(() => {
    hideQuestion();
  }, 15000);
}

function handleOptionClick(clickedBtn) {
  const selectedIndex = parseInt(clickedBtn.dataset.index);
  const correctIndex = currentQuestion.correct;
  const resultDiv = questionElement.querySelector('.result');
  const optionButtons = questionElement.querySelectorAll('.option-btn');

  // Disable all buttons
  optionButtons.forEach(btn => {
    btn.disabled = true;
  });

  // Show correct/incorrect styling
  optionButtons.forEach((btn, index) => {
    if (index === correctIndex) {
      btn.classList.add('correct');
    } else if (index === selectedIndex && index !== correctIndex) {
      btn.classList.add('incorrect');
    }
  });

  // Show result
  if (selectedIndex === correctIndex) {
    resultDiv.textContent = '🎉 Correct! Well done!';
    resultDiv.className = 'result correct';
  } else {
    resultDiv.textContent = `❌ Incorrect. The correct answer is ${currentQuestion.options[correctIndex]}`;
    resultDiv.className = 'result incorrect';
  }
  
  resultDiv.style.display = 'block';

  // Clear auto-hide timeout
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }

  // Hide after showing result for 5 seconds
  setTimeout(() => {
    hideQuestion();
  }, 5000);
}

function hideQuestion() {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }

  if (questionElement) {
    questionElement.classList.add('hide');
    setTimeout(() => {
      if (questionElement && questionElement.parentNode) {
        questionElement.parentNode.removeChild(questionElement);
      }
      questionElement = null;
      currentQuestion = null;
    }, 400);
  }
}