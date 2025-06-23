class QuestionManager {
  constructor() {
    this.questions = [];
    this.enabled = true;
    this.init();
  }

  async init() {
    await this.loadData();
    this.setupEventListeners();
    this.renderQuestions();
    this.showRandomQuestion();
  }

  async loadData() {
    const result = await chrome.storage.sync.get(['questions', 'enabled']);
    this.questions = result.questions || [];
    this.enabled = result.enabled !== false;
    
    document.getElementById('enableToggle').checked = this.enabled;
  }

  setupEventListeners() {
    // Toggle switch
    document.getElementById('enableToggle').addEventListener('change', (e) => {
      this.enabled = e.target.checked;
      chrome.storage.sync.set({ enabled: this.enabled });
    });

    // New question button
    document.getElementById('newQuestionBtn').addEventListener('click', () => {
      this.showRandomQuestion();
    });

    // Add question button
    document.getElementById('addQuestionBtn').addEventListener('click', () => {
      this.showQuestionInput();
    });

    // Cancel button
    document.getElementById('cancelBtn').addEventListener('click', () => {
      this.hideQuestionInput();
    });

    // Save button
    document.getElementById('saveBtn').addEventListener('click', () => {
      this.saveQuestion();
    });

    // Enter key in textarea
    document.getElementById('newQuestionInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        // Move to first option input
        document.getElementById('option1').focus();
      }
      if (e.key === 'Escape') {
        this.hideQuestionInput();
      }
    });

    // Tab navigation for option inputs
    ['option1', 'option2', 'option3', 'option4'].forEach((id, index) => {
      document.getElementById(id).addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (index < 3) {
            document.getElementById(['option1', 'option2', 'option3', 'option4'][index + 1]).focus();
          } else {
            document.getElementById('correctAnswer').focus();
          }
        }
      });
    });

    document.getElementById('correctAnswer').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.saveQuestion();
      }
    });
  }

  showQuestionInput() {
    const wrapper = document.getElementById('questionInputWrapper');
    const input = document.getElementById('newQuestionInput');
    
    wrapper.style.display = 'block';
    input.focus();
    input.value = '';
    
    // Clear all option inputs
    ['option1', 'option2', 'option3', 'option4'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('correctAnswer').value = '0';
  }

  hideQuestionInput() {
    const wrapper = document.getElementById('questionInputWrapper');
    wrapper.style.display = 'none';
  }

  async saveQuestion() {
    const questionText = document.getElementById('newQuestionInput').value.trim();
    const option1 = document.getElementById('option1').value.trim();
    const option2 = document.getElementById('option2').value.trim();
    const option3 = document.getElementById('option3').value.trim();
    const option4 = document.getElementById('option4').value.trim();
    const correctIndex = parseInt(document.getElementById('correctAnswer').value);
    
    if (!questionText || !option1 || !option2 || !option3 || !option4) {
      alert('Please fill in all fields');
      return;
    }

    const newQuestion = {
      question: questionText,
      options: [
        `A. ${option1}`,
        `B. ${option2}`,
        `C. ${option3}`,
        `D. ${option4}`
      ],
      correct: correctIndex
    };

    this.questions.push(newQuestion);
    await chrome.storage.sync.set({ questions: this.questions });
    
    this.hideQuestionInput();
    this.renderQuestions();
  }

  async deleteQuestion(index) {
    this.questions.splice(index, 1);
    await chrome.storage.sync.set({ questions: this.questions });
    this.renderQuestions();
  }

  renderQuestions() {
    const container = document.getElementById('questionsList');
    
    if (this.questions.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: #9ca3af; padding: 20px; font-style: italic;">
          No custom questions yet. Add some OOP questions!
        </div>
      `;
      return;
    }

    container.innerHTML = this.questions.map((question, index) => `
      <div class="question-item">
        <div class="question-item-header">
          <div class="question-item-text">${this.escapeHtml(question.question)}</div>
          <button class="delete-btn" data-index="${index}" title="Delete question">
            Delete
          </button>
        </div>
        <div class="question-options">
          ${question.options.map((option, optIndex) => `
            <div class="question-option ${optIndex === question.correct ? 'correct' : ''}">${this.escapeHtml(option)}</div>
          `).join('')}
        </div>
      </div>
    `).join('');

    // Add delete event listeners
    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        if (confirm('Are you sure you want to delete this question?')) {
          this.deleteQuestion(index);
        }
      });
    });
  }

  showRandomQuestion() {
    if (this.questions.length === 0) return;
    
    const randomQuestion = this.questions[Math.floor(Math.random() * this.questions.length)];
    const questionCard = document.getElementById('currentQuestion');
    
    // Animate the change
    questionCard.style.opacity = '0.5';
    questionCard.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      questionCard.innerHTML = `
        <div class="question-text">${this.escapeHtml(randomQuestion.question)}</div>
        <div class="options-preview">
          ${randomQuestion.options.map(option => `
            <div>${this.escapeHtml(option)}</div>
          `).join('')}
        </div>
      `;
      questionCard.style.opacity = '1';
      questionCard.style.transform = 'scale(1)';
    }, 150);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the popup
document.addEventListener('DOMContentLoaded', () => {
  new QuestionManager();
});