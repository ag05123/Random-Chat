const socket = io();
let name;
let textarea = document.querySelector('#textarea');
let btn = document.querySelector('.btn');
let btnImage = document.querySelector('.btn-image');
let imageInput = document.querySelector('#imageInput');
let messageArea = document.querySelector('.message__area');
let userSelect = document.querySelector('#userSelect');


do {
    name = prompt('Please enter your name: ');
} while (!name);

socket.emit('register', name); 

socket.on('userList', (users) => {
    userSelect.innerHTML = '<option value="all">Public Chat</option>';
    users.forEach(user => {
        if (user !== name) {
            userSelect.innerHTML += `<option value="${user}">${user}</option>`;
        }
    });
});


textarea.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' && textarea.value.trim() !== '') {
        sendMessage(textarea.value.trim(), userSelect.value);
        textarea.value = '';
    }
});

btn.addEventListener('click', () => {
    let message = textarea.value.trim();
    if (message !== '') {
        sendMessage(message, userSelect.value);
        textarea.value = '';
    }
});


function sendMessage(message, recipient = "all") {
    let msg = {
        user: name,
        message: message,
        type: 'text',
        recipient: recipient
    };

    appendMessage(msg, 'outgoing');
    scrollToBottom();

    socket.emit('message', msg);
}


btnImage.addEventListener('click', () => {
    let file = imageInput.files[0];

    if (!file) {
        alert('Please select an image.');
        return;
    }

    let reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
        let msg = {
            user: name,
            message: reader.result, 
            type: 'image',
            recipient: userSelect.value
        };

        appendMessage(msg, 'outgoing');
        socket.emit('message', msg);
        imageInput.value = "";
    };
});


function appendMessage(msg, type) {
    let mainDiv = document.createElement('div');
    mainDiv.classList.add(type, 'message');

    let markup = `<h4>${msg.user} ${msg.recipient !== 'all' ? `→ ${msg.recipient}` : ''}</h4>`;

    if (msg.type === 'text') {
        markup += `<p>${msg.message}</p>`;
    } else if (msg.type === 'image') {
        markup += `<img src="${msg.message}" class="chat-image" alt="Sent Image" 
        style="max-width: 200px; border-radius: 8px; cursor: pointer;">`;
    }

    mainDiv.innerHTML = markup;
    messageArea.appendChild(mainDiv);

  
    if (msg.type === 'image') {
        let imgElement = mainDiv.querySelector('.chat-image');
        imgElement.addEventListener('click', () => openImageModal(msg.message));
    }
}


socket.on('message', (msg) => {
    if (msg.recipient === name || msg.recipient === 'all') {
        appendMessage(msg, 'incoming');
        scrollToBottom();
    }
});


function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight;
}


function openImageModal(imageSrc) {
    let modal = document.getElementById('imageModal');
    let modalImg = document.getElementById('modalImg');

    modal.style.display = "flex";
    modalImg.src = imageSrc;
}

document.querySelector(".close").addEventListener("click", () => {
    document.getElementById("imageModal").style.display = "none";
});

document.getElementById("imageModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("imageModal")) {
        document.getElementById("imageModal").style.display = "none";
    }
});
