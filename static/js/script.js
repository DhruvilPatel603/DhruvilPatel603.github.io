let currentRecognition = null;
        let recognition = null;
        let isGeneratingResponse = false;  // Variable to track if the bot is generating a response

        // for scrolling messages
        function scrollToBottom() {
            var div = document.getElementById("upperid");
            div.scrollTop = div.scrollHeight;
        }
        scrollToBottom()

        // Load chat history from session storage
        async function loadChatHistory() {
    const response = await fetch('/history');
    const chatHistory = await response.json();
    const upperdiv = document.getElementById('upperid');
    upperdiv.innerHTML = '';
    chatHistory.forEach(entry => {
        if (entry.type === 'user') {
            upperdiv.innerHTML += `<div class="message"><div class="usermessagediv"><div class="usermessage">${entry.message}</div></div></div>`;
        } else if (entry.type === 'bot') {
            upperdiv.innerHTML += `<div class="message"><div class="appmessagediv"><div class="appmessage">${entry.message}</div></div></div>`;
        }
    });
    scrollToBottom();
}
loadChatHistory();

document.getElementById("userinputform").addEventListener("submit", function (event) {
    event.preventDefault();
    formsubmitted();
});

// adding event listener for shift+enter
document.getElementById("userinput").addEventListener("keydown", function(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        formsubmitted();
    }
});

        // sending request to python server
        const formsubmitted = async () => {
            if (currentRecognition) {
                currentRecognition.abort();
            }

            if (recognition) {
                recognition.stop();
                micBtn.classList.remove('active');
                micBtn.innerHTML = `<svg aria-hidden="true" class="w-6 h-6" fill="currentColor" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-5.0 -10.0 110.0 135.0">
                                <g>
                                 <path d="m78.875 50c0.25-1.7109 0.34766-3.4375 0.29297-5.168v-7.332c0-2.0234-1.6445-3.668-3.668-3.668s-3.668 1.6445-3.668 3.668v5.625z"/>
                                 <path d="m64.668 88.832h-7.3359c-2.0234 0-3.6641-1.6406-3.6641-3.6641v-8.3359c0.027343-1.7539 1.2773-3.2461 3-3.582 3.582-0.82812 6.9727-2.3281 10-4.418l-5.25-5.25c-2.1914 1.4922-4.6562 2.543-7.25 3.0859-6.4297 1.1719-13.051-0.56641-18.07-4.75-5.0195-4.1875-7.9258-10.383-7.9297-16.918v-7.5c0-2.0234-1.6445-3.668-3.668-3.668s-3.668 1.6445-3.668 3.668v11.043c-0.11328 7.3711 3.332 14.352 9.25 18.75 4 2.9141 8.5508 4.9805 13.375 6.082 1.7461 0.33594 3.0156 1.8477 3.043 3.625v8.332c0 0.97266-0.38672 1.9062-1.0742 2.5938s-1.6211 1.0742-2.5938 1.0742h-7.5c-2.0234 0-3.6641 1.6406-3.6641 3.668 0 2.0234 1.6406 3.6641 3.6641 3.6641h29.168c2.0234 0 3.668-1.6406 3.668-3.6641 0-2.0273-1.6445-3.668-3.668-3.668z"/>
                                 <path d="m64.668 35.793v-12.961c0.023437-3.7578-1.4023-7.3789-3.9844-10.109-2.5781-2.7305-6.1133-4.3633-9.8672-4.5508s-7.4336 1.0781-10.273 3.5352z"/>
                                 <path d="m35.332 37.5v7.25c-0.042969 5.0273 2.4961 9.7266 6.7227 12.441 4.2305 2.7148 9.5625 3.0664 14.113 0.93359z"/>
                                 <path d="m17.758 6.6641 2.2383-2.2383c0.8125-0.8125 2.2852-0.66016 2.9453 0l59.277 59.277c0.8125 0.8125 0.8125 2.1328 0 2.9453l-2.2383 2.2383c-0.8125 0.8125-2.2852 0.66016-2.9453 0l-59.277-59.277c-0.8125-0.8125-0.8125-2.1328 0-2.9453z"/>
                                </g></svg>`;
            }

            let userinput = document.getElementById('userinput').value;
            let sendbtn = document.getElementById('sendbtn');
            let userinputarea = document.getElementById('userinput');
            let upperdiv = document.getElementById('upperid');

            upperdiv.innerHTML = upperdiv.innerHTML + `<div class="message"><div class="usermessagediv"><div class="usermessage">${userinput}</div></div></div>`;
            sendbtn.disabled = true;
            userinputarea.disabled = true;
            micBtn.disabled = true;  // Disable mic button
            isGeneratingResponse = true;  // Set the flag to true
            scrollToBottom();
            document.getElementById('userinput').value = "";
            document.getElementById('userinput').placeholder = "Wait . . .";

            const response = await fetch("/data", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: userinput })
            });     

            let json = await response.json();
            document.getElementById('userinput').placeholder = "Your message...";

            if (json.response) {
                let message = json.message;
                message = message.toString();

                upperdiv.innerHTML = upperdiv.innerHTML + `<div class="message"><div class="appmessagediv"><div class="appmessage" id="temp"></div></div></div>`;
                let temp = document.getElementById('temp');
                let index = 0;

                function displayNextLetter() {
                    scrollToBottom();
                    if (index < message.length) {
                        temp.innerHTML = temp.innerHTML + message[index];
                        index++;
                        setTimeout(displayNextLetter, 30);
                    } else {
                        temp.removeAttribute('id');
                        sendbtn.disabled = false;
                        userinputarea.disabled = false;
                        micBtn.disabled = false;  // Enable mic button
                        isGeneratingResponse = false;  // Set the flag to false
                        if (json.redirect) {
                            window.open(json.redirect, '_blank'); // Open the redirect URL in a new tab
                        }
                    }
                }

                currentRecognition = { abort: () => { clearTimeout(displayNextLetter) } };
                displayNextLetter();
                scrollToBottom();
            } else {
                let message = json.message;
                upperdiv.innerHTML = upperdiv.innerHTML + `<div class="message"><div class="appmessagediv"><div class="appmessage" style="border: 1px solid red;">${message}</div></div></div>`;
                sendbtn.disabled = false;
                userinputarea.disabled = false;
                micBtn.disabled = false;  // Enable mic button
                isGeneratingResponse = false;  // Set the flag to false
            }
            scrollToBottom();
        };

        document.getElementById("clearbtn").addEventListener("click", async function () {
            await saveChatHistory();  // Save chat history before clearing
            const response = await fetch('/clear', { method: 'POST' });
            const result = await response.json();
            if (result.response) {
                document.getElementById('upperid').innerHTML = '<span class="downwarning">Type your message in box below.</span>';
            }
        });

        // Save chat history when the page is reloaded or closed
        window.addEventListener('beforeunload', async function (event) {
            await saveChatHistory();
        });

        async function saveChatHistory() {
            await fetch('/save', { method: 'POST' });
        }

        // Speech recognition functionality
        const micBtn = document.getElementById('micbtn');
        if ('webkitSpeechRecognition' in window) {
            recognition = new webkitSpeechRecognition();
        } else if ('SpeechRecognition' in window) {
            recognition = new SpeechRecognition();
        } else {
            alert('Your browser does not support speech recognition. Try Chrome or Firefox.');
        }

        if (recognition) {
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-IN';

            recognition.onstart = function() {
                micBtn.classList.add('active');
                micBtn.innerHTML = `<svg aria-hidden="true" class="w-6 h-6" fill="currentColor" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-5.0 -10.0 110.0 135.0">
                                    <g>
                                    <path d="m50 57.625c4.0547 0 7.9453-1.6094 10.812-4.4805 2.8672-2.8672 4.4805-6.7539 4.4805-10.812v-22.875c0.21875-4.1875-1.293-8.2812-4.1797-11.324-2.8867-3.043-6.8984-4.7656-11.094-4.7656-4.1914 0-8.2031 1.7227-11.09 4.7656-2.8867 3.043-4.3984 7.1367-4.1797 11.324v22.918c0.011719 4.043 1.6211 7.9141 4.4805 10.77 2.8555 2.8594 6.7266 4.4688 10.77 4.4805z"/>
                                    <path d="m76.75 30.918c-2.1172 0-3.832 1.7148-3.832 3.832v6.293c0.13672 5.5391-1.6602 10.949-5.082 15.309-3.4219 4.3555-8.2578 7.3867-13.668 8.5664-6.6953 1.2227-13.586-0.58594-18.812-4.9414-5.2305-4.3516-8.2578-10.797-8.2734-17.602v-7.668c-0.20312-1.9492-1.8477-3.4336-3.8125-3.4336-1.9609 0-3.6055 1.4844-3.8125 3.4336v11.5c-0.10156 7.6992 3.5117 14.977 9.7109 19.543 4.1719 3.0352 8.9219 5.1914 13.957 6.332 1.8125 0.33984 3.1367 1.9062 3.168 3.75v8.543c0 1.0156-0.40625 1.9922-1.125 2.7109s-1.6914 1.1211-2.7109 1.1211h-7.75c-1.9492 0.20703-3.4336 1.8516-3.4336 3.8125 0 1.9648 1.4844 3.6094 3.4336 3.8125h30.543c1.9531-0.20312 3.4336-1.8477 3.4336-3.8125 0-1.9609-1.4805-3.6055-3.4336-3.8125h-7.625c-2.1172 0-3.832-1.7148-3.832-3.832v-8.582c0.042969-1.8164 1.3398-3.3594 3.125-3.7109 6.7031-1.5586 12.684-5.3359 16.973-10.723 4.2891-5.3828 6.6328-12.059 6.6523-18.941v-7.7109c-0.023438-2.082-1.707-3.7695-3.793-3.7891z"/>
                                    </g></svg>`;
                                    };

            recognition.onend = function() {
                micBtn.classList.remove('active');
                micBtn.innerHTML = `<svg aria-hidden="true" class="w-6 h-6" fill="currentColor" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-5.0 -10.0 110.0 135.0">
                                <g>
                                 <path d="m78.875 50c0.25-1.7109 0.34766-3.4375 0.29297-5.168v-7.332c0-2.0234-1.6445-3.668-3.668-3.668s-3.668 1.6445-3.668 3.668v5.625z"/>
                                 <path d="m64.668 88.832h-7.3359c-2.0234 0-3.6641-1.6406-3.6641-3.6641v-8.3359c0.027343-1.7539 1.2773-3.2461 3-3.582 3.582-0.82812 6.9727-2.3281 10-4.418l-5.25-5.25c-2.1914 1.4922-4.6562 2.543-7.25 3.0859-6.4297 1.1719-13.051-0.56641-18.07-4.75-5.0195-4.1875-7.9258-10.383-7.9297-16.918v-7.5c0-2.0234-1.6445-3.668-3.668-3.668s-3.668 1.6445-3.668 3.668v11.043c-0.11328 7.3711 3.332 14.352 9.25 18.75 4 2.9141 8.5508 4.9805 13.375 6.082 1.7461 0.33594 3.0156 1.8477 3.043 3.625v8.332c0 0.97266-0.38672 1.9062-1.0742 2.5938s-1.6211 1.0742-2.5938 1.0742h-7.5c-2.0234 0-3.6641 1.6406-3.6641 3.668 0 2.0234 1.6406 3.6641 3.6641 3.6641h29.168c2.0234 0 3.668-1.6406 3.668-3.6641 0-2.0273-1.6445-3.668-3.668-3.668z"/>
                                 <path d="m64.668 35.793v-12.961c0.023437-3.7578-1.4023-7.3789-3.9844-10.109-2.5781-2.7305-6.1133-4.3633-9.8672-4.5508s-7.4336 1.0781-10.273 3.5352z"/>
                                 <path d="m35.332 37.5v7.25c-0.042969 5.0273 2.4961 9.7266 6.7227 12.441 4.2305 2.7148 9.5625 3.0664 14.113 0.93359z"/>
                                 <path d="m17.758 6.6641 2.2383-2.2383c0.8125-0.8125 2.2852-0.66016 2.9453 0l59.277 59.277c0.8125 0.8125 0.8125 2.1328 0 2.9453l-2.2383 2.2383c-0.8125 0.8125-2.2852 0.66016-2.9453 0l-59.277-59.277c-0.8125-0.8125-0.8125-2.1328 0-2.9453z"/>
                                </g></svg>`;
            };

            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                document.getElementById('userinput').value = transcript;
                formsubmitted();
            };

            micBtn.addEventListener('click', function() {
                if (!isGeneratingResponse) {  // Check if the bot is not generating a response
                    if (recognition) {
                        if (micBtn.classList.contains('active')) {
                            recognition.stop();
                        } else {
                            recognition.start();
                        }
                    }
                }
            });
        }