let lastActiveTabId = null;
let isEnabled = true;

// Default OOP MCQ questions
const defaultQuestions = [
  {
    question: "What is encapsulation in OOP?",
    options: [
      "A. Hiding implementation details and exposing only necessary interfaces",
      "B. Creating multiple instances of a class",
      "C. Inheriting properties from parent class",
      "D. Overriding methods in derived classes"
    ],
    correct: 0
  },
  {
    question: "Which principle allows a class to inherit properties from another class?",
    options: [
      "A. Polymorphism",
      "B. Encapsulation",
      "C. Inheritance",
      "D. Abstraction"
    ],
    correct: 2
  },
  {
    question: "What is method overriding?",
    options: [
      "A. Creating multiple methods with same name but different parameters",
      "B. Redefining a method in derived class that exists in base class",
      "C. Hiding a method from outside access",
      "D. Creating abstract methods"
    ],
    correct: 1
  },
  {
    question: "What is polymorphism?",
    options: [
      "A. Having multiple constructors",
      "B. The ability of objects to take multiple forms",
      "C. Creating private variables",
      "D. Inheriting from multiple classes"
    ],
    correct: 1
  },
  {
    question: "What is an abstract class?",
    options: [
      "A. A class that cannot be instantiated directly",
      "B. A class with only private methods",
      "C. A class that inherits from multiple parents",
      "D. A class with no methods"
    ],
    correct: 0
  },
  {
    question: "What is the difference between method overloading and overriding?",
    options: [
      "A. No difference, they are the same",
      "B. Overloading is compile-time, overriding is runtime",
      "C. Overloading is runtime, overriding is compile-time",
      "D. Both happen at runtime"
    ],
    correct: 1
  },
  {
    question: "What is a constructor?",
    options: [
      "A. A method that destroys objects",
      "B. A special method called when object is created",
      "C. A method that returns the class name",
      "D. A static method in a class"
    ],
    correct: 1
  },
  {
    question: "What is the 'this' keyword used for?",
    options: [
      "A. To refer to the current class",
      "B. To refer to the parent class",
      "C. To refer to the current object instance",
      "D. To create new objects"
    ],
    correct: 2
  },
  {
    question: "What is composition in OOP?",
    options: [
      "A. Inheriting from multiple classes",
      "B. Creating objects that contain other objects",
      "C. Overriding parent methods",
      "D. Making all methods static"
    ],
    correct: 1
  },
  {
    question: "What is the purpose of access modifiers?",
    options: [
      "A. To modify method behavior",
      "B. To control visibility and accessibility of class members",
      "C. To change inheritance hierarchy",
      "D. To optimize performance"
    ],
    correct: 1
  }
];

// Initialize storage with default questions
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['questions', 'enabled'], (result) => {
    if (!result.questions) {
      chrome.storage.sync.set({ questions: defaultQuestions });
    }
    if (result.enabled === undefined) {
      chrome.storage.sync.set({ enabled: true });
    }
  });
});

// Listen for tab activation (switching tabs)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await handleTabChange(activeInfo.tabId);
});

// Listen for tab updates (new pages loading)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    await handleTabChange(tabId);
  }
});

async function handleTabChange(tabId) {
  // Check if feature is enabled
  const result = await chrome.storage.sync.get(['enabled']);
  if (!result.enabled) return;

  // Avoid showing question for the same tab repeatedly
  if (lastActiveTabId === tabId) return;
  lastActiveTabId = tabId;

  // Get random question
  const questions = await getQuestions();
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

  // Send question to content script
  try {
    await chrome.tabs.sendMessage(tabId, {
      action: 'showQuestion',
      question: randomQuestion
    });
  } catch (error) {
    // Ignore errors for pages that don't support content scripts
  }
}

async function getQuestions() {
  const result = await chrome.storage.sync.get(['questions']);
  return result.questions || defaultQuestions;
}