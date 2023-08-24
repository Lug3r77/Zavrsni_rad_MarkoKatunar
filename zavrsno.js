const channelID = "iQ488MAMLIbfZhtJ";

let korisničkoIme = "";

while (korisničkoIme.trim() === "") {
  korisničkoIme = prompt("Upiši korisničko ime kako bi se spojio u chat sobu:");
}

const drone = new ScaleDrone(channelID, {
  data: {
    name: imeUsera(),
    color: getRandomColor(),
  },
});

let members = [];

drone.on("open", (error) => {
  if (error) {
    return console.error(error);
  }
  console.log("Successfully connected to Scaledrone");

  const room = drone.subscribe("observable-room");
  room.on("open", (error) => {
    if (error) {
      return console.error(error);
    }
    console.log("Successfully joined room");
  });

  room.on("members", (m) => {
    members = m;
    updateMembers();
  });

  room.on("member_join", (member) => {
    members.push(member);
    updateMembers();
  });

  room.on("member_leave", ({ id }) => {
    const index = members.findIndex((member) => member.id === id);
    members.splice(index, 1);
    updateMembers();
  });

  room.on("data", (text, member) => {
    if (member) {
      addMessageToList(text, member);
    }
  });
});

drone.on("close", (event) => {
  console.log("Connection was closed", event);
});

drone.on("error", (error) => {
  console.error(error);
});

function imeUsera() {
  return `${korisničkoIme}`;
}

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const brojKorisnika = document.querySelector(".brojKorisnika");
const aktivniUseri = document.querySelector(".aktivniUseri");
const messages = document.querySelector(".poruke");
const input = document.querySelector("#message-input");
const form = document.querySelector(".message-form");

input.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});

function sendMessage() {
  const value = input.value;
  if (value === "") {
    return;
  }
  input.value = "";
  drone.publish({
    room: "observable-room",
    message: value,
  });
}

function createMemberElement(member) {
  const { name, color } = member.clientData;
  const el = document.createElement("div");
  el.appendChild(document.createTextNode(name));
  el.className = "member";
  el.style.backgroundColor = color;
  el.style.color = "white";
  return el;
}

function updateMembers() {
  brojKorisnika.innerText = `${members.length} users in room:`;
  aktivniUseri.innerHTML = "";
  members.forEach((member) =>
  aktivniUseri.appendChild(createMemberElement(member))
  );
}

function createMessageElement(text, member) {
  const el = document.createElement("div");
  const memberElement = createMemberElement(member);
  memberElement.appendChild(document.createTextNode(": "));
  el.appendChild(memberElement);
  el.appendChild(document.createTextNode(text));
  el.className = "message";
  el.style.backgroundColor = member.clientData.color;
  el.style.color = "white";
  return el;
}

function addMessageToList(text, member) {
  const el = messages;

  const messageElement = createMessageElement(text, member);
  el.appendChild(messageElement);

  messageElement.scrollIntoView({ behavior: "smooth", block: "end" });
}
