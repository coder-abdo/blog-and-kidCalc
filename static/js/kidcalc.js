// kidCalc JavaScript functionality

document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const loginSection = document.getElementById("login-section");
  const calculatorSection = document.getElementById("calculator-section");
  const loginForm = document.getElementById("login-form");
  const logoutBtn = document.getElementById("logout-btn");
  const welcomeText = document.getElementById("welcome-text");
  const userNameSpan = document.getElementById("user-name");
  const userGreeting = document.getElementById("user-greeting");
  const themeButtons = document.querySelectorAll(".theme-btn, .theme-option");
  const answerInput = document.getElementById("answer-input");
  const equalsBtn = document.getElementById("equals-btn");
  const newProblemBtn = document.getElementById("new-problem-btn");
  const clearBtn = document.getElementById("clear-btn");
  const backspaceBtn = document.getElementById("backspace-btn");
  const hintBtn = document.getElementById("hint-btn");
  const soundToggle = document.getElementById("sound-toggle");
  const calcButtons = document.querySelectorAll(".calc-btn");
  const display = document.getElementById("display");
  const historyDisplay = document.getElementById("history");

  // Calculator state
  let currentUser = localStorage.getItem("kidcalc_user") || "Guest";
  let currentTheme = localStorage.getItem("kidcalc_theme") || "ocean";
  let currentProblem = generateProblem();
  let correctAnswers = parseInt(localStorage.getItem("kidcalc_correct")) || 0;
  let wrongAnswers = parseInt(localStorage.getItem("kidcalc_wrong")) || 0;
  let currentStreak = 0;
  let soundEnabled = true;
  let displayValue = "0";
  let operator = null;
  let firstOperand = null;
  let waitingForSecondOperand = false;

  // Audio elements
  const correctSound = document.getElementById("correct-sound");
  const wrongSound = document.getElementById("wrong-sound");
  const clickSound = document.getElementById("click-sound");

  // Initialize
  init();

  function init() {
    // Load saved user data
    if (currentUser !== "Guest") {
      showCalculator();
    }

    // Set initial theme
    setTheme(currentTheme);

    // Update scores
    updateScores();

    // Generate first problem
    updateProblemDisplay();

    // Set up event listeners
    setupEventListeners();
  }

  function setupEventListeners() {
    // Login form
    loginForm.addEventListener("submit", handleLogin);

    // Logout button
    logoutBtn.addEventListener("submit", handleLogout);

    // Theme buttons
    themeButtons.forEach((button) => {
      button.addEventListener("click", handleThemeChange);
    });

    // Math problem answer input
    answerInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        checkAnswer();
      }
    });

    // Calculator buttons
    equalsBtn.addEventListener("click", checkAnswer);
    newProblemBtn.addEventListener("click", generateNewProblem);
    clearBtn.addEventListener("click", clearCalculator);
    backspaceBtn.addEventListener("click", backspace);
    hintBtn.addEventListener("click", showHint);
    soundToggle.addEventListener("click", toggleSound);

    // Calculator number and operation buttons
    calcButtons.forEach((button) => {
      button.addEventListener("click", handleCalcButton);
    });
  }

  function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const age = document.getElementById("age").value;
    const selectedTheme =
      document.querySelector(".theme-option.active")?.dataset.theme || "ocean";

    if (!username || !age) {
      alert("Please enter your name and age!");
      return;
    }

    // Save user data
    currentUser = username;
    localStorage.setItem("kidcalc_user", username);
    localStorage.setItem("kidcalc_age", age);

    // Set theme
    setTheme(selectedTheme);
    localStorage.setItem("kidcalc_theme", selectedTheme);

    // Show calculator
    showCalculator();

    // Play sound
    playSound(clickSound);
  }

  function handleLogout() {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("kidcalc_user");
      localStorage.removeItem("kidcalc_age");
      currentUser = "Guest";
      showLogin();
      playSound(clickSound);
    }
  }

  function handleThemeChange(e) {
    const theme = e.currentTarget.dataset.theme;
    setTheme(theme);
    localStorage.setItem("kidcalc_theme", theme);
    playSound(clickSound);

    // Update active state for theme buttons
    document.querySelectorAll(".theme-btn, .theme-option").forEach((btn) => {
      btn.classList.remove("active");
    });
    e.currentTarget.classList.add("active");
  }

  function setTheme(theme) {
    document.body.className = `theme-${theme}`;
    currentTheme = theme;
  }

  function showCalculator() {
    loginSection.style.display = "none";
    calculatorSection.style.display = "block";

    // Update user info
    const age = localStorage.getItem("kidcalc_age") || "";
    const ageText = age ? `, age ${age}` : "";
    userNameSpan.textContent = currentUser;
    userGreeting.textContent = `Hello, ${currentUser}${ageText}! Let's solve some math problems!`;
    welcomeText.textContent = `Welcome back, ${currentUser}! Ready for more math adventures?`;

    // Set active theme button
    document
      .querySelectorAll(`[data-theme="${currentTheme}"]`)
      .forEach((btn) => {
        btn.classList.add("active");
      });
  }

  function showLogin() {
    loginSection.style.display = "flex";
    calculatorSection.style.display = "none";
    userNameSpan.textContent = "Guest";
    welcomeText.textContent = "Welcome to kidCalc! Let's learn math with fun!";
  }

  function generateProblem() {
    const operations = ["+", "-", "×", "÷"];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let num1, num2;

    switch (operation) {
      case "+":
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        break;
      case "-":
        num1 = Math.floor(Math.random() * 20) + 10;
        num2 = Math.floor(Math.random() * 10) + 1;
        num1 = Math.max(num1, num2 + 1);
        break;
      case "×":
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        break;
      case "÷":
        num2 = Math.floor(Math.random() * 10) + 1;
        const result = Math.floor(Math.random() * 10) + 1;
        num1 = num2 * result;
        break;
    }

    return { num1, num2, operation };
  }

  function updateProblemDisplay() {
    document.getElementById("num1").textContent = currentProblem.num1;
    document.getElementById("num2").textContent = currentProblem.num2;
    document.getElementById("operator").textContent = currentProblem.operation;
    answerInput.value = "";
    answerInput.focus();
  }

  function generateNewProblem() {
    currentProblem = generateProblem();
    updateProblemDisplay();
    playSound(clickSound);
  }

  function checkAnswer() {
    const userAnswer = parseInt(answerInput.value);
    if (isNaN(userAnswer)) {
      showFeedback("Please enter a number!", "error");
      return;
    }

    let correctAnswer;
    switch (currentProblem.operation) {
      case "+":
        correctAnswer = currentProblem.num1 + currentProblem.num2;
        break;
      case "-":
        correctAnswer = currentProblem.num1 - currentProblem.num2;
        break;
      case "×":
        correctAnswer = currentProblem.num1 * currentProblem.num2;
        break;
      case "÷":
        correctAnswer = currentProblem.num1 / currentProblem.num2;
        break;
    }

    if (userAnswer === correctAnswer) {
      // Correct answer
      correctAnswers++;
      currentStreak++;
      localStorage.setItem("kidcalc_correct", correctAnswers);
      showFeedback(
        `Correct! ${currentProblem.num1} ${currentProblem.operation} ${currentProblem.num2} = ${correctAnswer}`,
        "success",
      );
      playSound(correctSound);

      // Update adventure counts based on theme
      updateAdventureCount();
    } else {
      // Wrong answer
      wrongAnswers++;
      currentStreak = 0;
      localStorage.setItem("kidcalc_wrong", wrongAnswers);
      showFeedback(
        `Try again! ${currentProblem.num1} ${currentProblem.operation} ${currentProblem.num2} = ${correctAnswer}`,
        "error",
      );
      playSound(wrongSound);
    }

    updateScores();

    // Generate new problem after delay
    setTimeout(() => {
      generateNewProblem();
      showFeedback("Enter your answer and press Enter or click =", "info");
    }, 2000);
  }

  function showFeedback(message, type) {
    const feedback = document.getElementById("feedback");
    feedback.innerHTML = `<i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "times-circle" : "lightbulb"}"></i> ${message}`;
    feedback.className = `problem-feedback ${type}`;
  }

  function updateScores() {
    document.getElementById("correct-score").textContent = correctAnswers;
    document.getElementById("wrong-score").textContent = wrongAnswers;
    document.getElementById("streak").textContent = currentStreak;
  }

  function updateAdventureCount() {
    const adventureItem = document.querySelector(
      `#${currentTheme}-adventure .adventure-count`,
    );
    if (adventureItem) {
      const currentCount = parseInt(adventureItem.textContent) || 0;
      adventureItem.textContent = currentCount + 1;
    }
  }

  function showHint() {
    let hint = "";
    switch (currentProblem.operation) {
      case "+":
        hint = `Try counting: Start at ${currentProblem.num1} and count ${currentProblem.num2} more.`;
        break;
      case "-":
        hint = `Try counting backward: Start at ${currentProblem.num1} and count back ${currentProblem.num2}.`;
        break;
      case "×":
        hint = `Think of groups: ${currentProblem.num1} groups of ${currentProblem.num2}.`;
        break;
      case "÷":
        hint = `Think of sharing: Share ${currentProblem.num1} among ${currentProblem.num2} groups.`;
        break;
    }
    showFeedback(`Hint: ${hint}`, "info");
    playSound(clickSound);
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    const icon = soundToggle.querySelector("i");
    icon.className = soundEnabled ? "fas fa-volume-up" : "fas fa-volume-mute";
    showFeedback(`Sound ${soundEnabled ? "enabled" : "disabled"}`, "info");
    playSound(clickSound);
  }

  function playSound(sound) {
    if (soundEnabled && sound) {
      sound.currentTime = 0;
      sound.play().catch((e) => console.log("Audio play failed:", e));
    }
  }

  // Calculator functions
  function handleCalcButton(e) {
    const button = e.currentTarget;
    const value = button.dataset.value;
    const operation = button.dataset.operation;

    playSound(clickSound);

    if (value) {
      inputDigit(value);
    } else if (operation) {
      handleOperation(operation);
    }

    updateDisplay();
  }

  function inputDigit(digit) {
    if (waitingForSecondOperand) {
      displayValue = digit;
      waitingForSecondOperand = false;
    } else {
      displayValue = displayValue === "0" ? digit : displayValue + digit;
    }
  }

  function handleOperation(nextOperator) {
    const inputValue = parseFloat(displayValue);

    if (firstOperand === null) {
      firstOperand = inputValue;
    } else if (operator) {
      const result = performCalculation();
      displayValue = `${parseFloat(result.toFixed(7))}`;
      firstOperand = result;

      // Update history
      historyDisplay.textContent = `${firstOperand} ${getOperationSymbol(operator)} ${inputValue} = ${result}`;
    }

    waitingForSecondOperand = true;
    operator = nextOperator;
  }

  function performCalculation() {
    const inputValue = parseFloat(displayValue);

    switch (operator) {
      case "add":
        return firstOperand + inputValue;
      case "subtract":
        return firstOperand - inputValue;
      case "multiply":
        return firstOperand * inputValue;
      case "divide":
        return firstOperand / inputValue;
      default:
        return inputValue;
    }
  }

  function getOperationSymbol(op) {
    switch (op) {
      case "add":
        return "+";
      case "subtract":
        return "-";
      case "multiply":
        return "×";
      case "divide":
        return "÷";
      default:
        return "";
    }
  }

  function clearCalculator() {
    displayValue = "0";
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
    historyDisplay.textContent = "";
    updateDisplay();
    playSound(clickSound);
  }

  function backspace() {
    if (displayValue.length > 1) {
      displayValue = displayValue.slice(0, -1);
    } else {
      displayValue = "0";
    }
    updateDisplay();
    playSound(clickSound);
  }

  function updateDisplay() {
    display.textContent = displayValue;
  }

  // Keyboard support
  document.addEventListener("keydown", function (e) {
    if (/[0-9]/.test(e.key)) {
      inputDigit(e.key);
      updateDisplay();
    } else if (e.key === ".") {
      if (!displayValue.includes(".")) {
        displayValue += ".";
        updateDisplay();
      }
    } else if (e.key === "Enter") {
      checkAnswer();
    } else if (e.key === "Escape") {
      clearCalculator();
    } else if (e.key === "Backspace") {
      backspace();
    } else if (e.key === "+") {
      handleOperation("add");
      updateDisplay();
    } else if (e.key === "-") {
      handleOperation("subtract");
      updateDisplay();
    } else if (e.key === "*") {
      handleOperation("multiply");
      updateDisplay();
    } else if (e.key === "/") {
      handleOperation("divide");
      updateDisplay();
    }
  });
});
