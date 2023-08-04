import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("#form");
const chatContainer = document.querySelector("#chatContainer");
let isDarkMode = false;
let loadInterval;

const loader = (element) => {
  element.textContent = "";
  loadInterval = setInterval(() => {
    element.textContent += ".";
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
};

const typeText = (element, text) => {
  let index = 0;
  const interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 30);
};

// const generateUniqueId = () => {
//   const timeStamp = Date.now();
//   const randomNumber = Math.random();
//   const hexaDecimal = randomNumber.toString(16);
//   return `id-${timeStamp}-${hexaDecimal}`;
// };
const generateUniqueId = () => {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 10;
  let uniqueId = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uniqueId += characters.charAt(randomIndex);
  }
  return `id-${uniqueId}`;
};

const chatStripe = (isAi, value, uniqueId) => {
  return `
    <div class = "wrapper${isAi && "ai"}">
    <div class='chat'>
    <div class='profile'>
    <img src="${isAi ? bot : user}" alt="${isAi ? "bot" : "user"}"
    />
    </div>
    <div class="message" id="${uniqueId}">${value}</div>
    </div>
    </div>
    `;
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  //   user stripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
  form.reset();

  // bot's chatStripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, "", uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.querySelector(`#${uniqueId}`);
  loader(messageDiv);
  try {
    const response = await fetch("http://localhost:5000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: data.get("prompt"),
      }),
    });
    clearInterval(loadInterval);
    messageDiv.innerHTML = "";
    if (response.ok) {
      const responseData = await response.json();
      const botReply = responseData.bot;
      if (botReply) {
        const parsedData = botReply.trim();
        typeText(messageDiv, parsedData);
      } else {
        messageDiv.innerHTML = "No response from the server";
      }
    } else {
      const err = await response.text();
      messageDiv.innerHTML = "Something went wrong";
      // alert(err);
      console.log(err);
    }
    // if (isDarkMode) {
    //   messageDiv.classList.add("darkModeColor");
    // } else {
    //   messageDiv.classList.remove("darkModeColor");
    // }
  } catch (error) {
    console.error(error);
    messageDiv.innerHTML = "Something went wrong";
    alert("Error occurred while communicating with the server");
  }
};
// const looponArray = (arr) => {
//   arr.forEach((message) => {
//     // if (message.classList.contains("darkModeColor")) {
//     //   message.classList.remove("darkModeColor");
//     // } else {
//     //   message.classList.add("darkModeColor");
//     // }
//     message.classList.toggle("darkModeColor");
//   });
// };

const darkModeFunc = (event) => {
  event.stopPropagation();
  console.log("clicked!");
  isDarkMode = !isDarkMode;
  const app = document.querySelector("#app");
  app.classList.toggle("darkMode");
  const chatContainer = document.querySelectorAll(".chatContainer");
  if (isDarkMode) {
    app.classList.add("darkMode");
    chatContainer.forEach((message) => {
      message.classList.add("darkModeColor");
    });
  } else {
    app.classList.remove("darkMode");
    chatContainer.forEach((message) => {
      message.classList.remove("darkModeColor");
    });
  }
  console.log(chatContainer);
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});

/*-----Light and Dark MOde------*/

const checkbox = document.querySelector("#checkbox");
checkbox.addEventListener("click", darkModeFunc);
