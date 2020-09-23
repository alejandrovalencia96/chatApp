var currentUserKey = '';
var chatKey = '';

document.addEventListener('keydown', function(key) {
    var keyCode = (window.event) ? key.which : key.keyCode;
    if (keyCode == 13) {
        sendMessage();

    }
})

///////////////
//Emoji
loadAllEmoji();

function loadAllEmoji() {
    var emoji = '';
    for (var i = 128512; i <= 128567; i++) {
        emoji += `<a href="#" onclick="getEmoji(this)" style="font-size:22px;">&#${i};</a>`;
    }
    document.getElementById('smiley').innerHTML = emoji;
}

function showEmojiPanel() {
    document.getElementById('emoji').removeAttribute('style');
}

function hideEmojiPanel() {
    document.getElementById('emoji').setAttribute('style', 'display:none;');
}

function getEmoji(control) {
    document.getElementById('txtMessage').value += control.innerHTML;
}

///////////////
function startChat(friendKey, friendName, friendPhoto) {
    var friendList = { friendId: friendKey, userId: currentUserKey };
    var db = firebase.database().ref('friend_list');
    var flag = false;
    db.on('value', function(friends) {
        friends.forEach(function(data) {
            var user = data.val();
            if ((user.friendId === friendList.friendId && user.userId === friendList.userId) || ((user.friendId === friendList.userId && user.userId === friendList.friendId))) {
                flag = true;
                chatKey = data.key;
            }
        });
        if (flag === false) {
            chatKey = firebase.database().ref('friend_list').push(friendList, function(error) {
                if (error) {
                    alert(error);
                } else {
                    document.getElementById('chatPanel').removeAttribute('style');
                    document.getElementById('divStart').setAttribute('style', 'display:none');
                    ocultarChatList();
                }
            }).getKey();
        } else {
            document.getElementById('chatPanel').removeAttribute('style');
            document.getElementById('divStart').setAttribute('style', 'display:none');
            ocultarChatList();
        }
        //////////////////////////
        // mostrar nombre y foto de amigo
        document.getElementById('divChatName').innerHTML = friendName;
        document.getElementById('imgChat').src = friendPhoto;

        document.getElementById('messages').innerHTML = '';

        document.getElementById('txtMessage').value = '';
        document.getElementById('txtMessage').focus();

        //////////////////////////
        // mostrar mensajes del chat
        LoadChatMessages(chatKey, friendPhoto);
    });
}

function LoadChatMessages(chatKey, friendPhoto) {
    var userPhoto = document.getElementById('imgProfile').src;
    var db = firebase.database().ref('chatMessages').child(chatKey);
    db.on('value', function(chats) {
        var messageDisplay = '';
        chats.forEach(function(data) {
            var chat = data.val();
            var dateTime = chat.dateTime.split(",");
            if (chat.userId !== currentUserKey) {
                messageDisplay += `<div class="row">
                <div class="col-2 col-sm-1 col-md-1">
                    <img src="${friendPhoto}" class="rounded-circle chat-pic">
                </div>
                <div class="col-6 col-sm-7 col-md-7">
                    <p class="receive">${chat.msg}
                    <span class="time float-right" title="${dateTime[0]}">${dateTime[1]}</span>
                    </p>
                </div>
            </div>`;
            } else {
                messageDisplay += `<div class="row justify-content-end"><div class="col-6 col-sm-7 col-md-7"><p class="sent float-right">
                ${chat.msg}
                <span class="time float-right" title="${dateTime[0]}">${dateTime[1]}</span></p></div><div class="col-2 col-sm-1 col-md-1"><img src="${userPhoto}" class="chat-pic rounded-circle"></div></div>`;


            }

        });
        document.getElementById('messages').innerHTML = messageDisplay;
        var myDivMessages = document.getElementById("messages");
        scroll_to(myDivMessages);
    });
}

function scroll_to(div) {
    div.scrollTop = div.scrollHeight - div.clientHeight;

}

function mostrarChatList() {
    document.getElementById('lado-1').classList.remove('d-none', 'd-md-block');
    document.getElementById('lado-2').classList.add('d-none');
}

function ocultarChatList() {
    document.getElementById('lado-1').classList.add('d-none', 'd-md-block');
    document.getElementById('lado-2').classList.remove('d-none');
}

function sendMessage() {
    var chatMessage = {
        userId: currentUserKey,
        msg: document.getElementById('txtMessage').value,
        dateTime: new Date().toLocaleString()
    };
    firebase.database().ref('chatMessages').child(chatKey).push(chatMessage, function(error) {
        if (error) {
            alert(error);
        } else {
            document.getElementById('txtMessage').value = '';
            document.getElementById('txtMessage').focus();
        }
    });


}

////////////////////////////

function LoadChatList() {
    var db = firebase.database().ref('friend_list');
    db.on('value', function(lists) {
        document.getElementById('lstChat').innerHTML = `<li class="list-group-item" style="background-color:#f8f8f8;">
        <input type="text" id="txtChatList placeholder="Buscar un nuevo chat" class="form-control form-rounded">
        </li>`;
        lists.forEach(function(data) {
            var lst = data.val();
            var friendKey = '';
            if (lst.friendId === currentUserKey) {
                friendKey = lst.userId;
            } else if (lst.userId === currentUserKey) {
                friendKey = lst.friendId;
            }
            firebase.database().ref('users').child(friendKey).on('value', function(data) {
                var user = data.val();
                document.getElementById('lstChat').innerHTML += `<li class="list-group-item list-group-item-action" onclick="startChat('${data.key}', '${user.name}', '${user.photoURL}')">
            <div class="row">
                <div class="col-md-2">
                    <img src="${user.photoURL}" class="rounded-circle friend-pic img-rounded">
                </div>
                <div class="col-md-10" style="cursor:pointer;">
                    <div class="name">${user.name}</div>
                    <div class="under-name">Ver mensajes...</div>
                </div>
            </div>
        </li>`;
            })

        })
    });
}


function PopulateFriendList() {

    document.getElementById('lstFriend').innerHTML = `<div class="text-center">
    <span class="spinner-border text-primary mt-5" style="width:7rem;height:7rem;"></span>
    </div>`;

    var db = firebase.database().ref('users');
    var lst = '';
    db.on('value', function(users) {
        if (users.hasChildren()) {
            lst = `<li class="list-group-item" style="background-color:#f8f8f8;">
                        <input type="text" placeholder="Buscar un nuevo chat" class="form-control form-rounded">
                        </li>`;
        }
        users.forEach(function(data) {
            var users = data.val();
            // no mostrar en la lista de amigos tu usuario
            if (users.email !== firebase.auth().currentUser.email) {
                lst += `<li class="list-group-item list-group-item-action" data-dismiss="modal" onclick="startChat('${data.key}', '${users.name}', '${users.photoURL}')">
                <div class="row">
                    <div class="col-md-2">
                        <img src="${users.photoURL}" class="rounded-circle friend-pic img-rounded">
                    </div>
                    <div class="col-md-10" style="cursor:pointer;">
                        <div class="name">${users.name}</div>
                    </div>
                </div>
            </li>`;
            }

        });
        document.getElementById('lstFriend').innerHTML = lst;
    });

}


function signOut() {
    firebase.auth().signOut();
    window.location.href = "login.html";

}

function onFirebaseStateChanged() {
    firebase.auth().onAuthStateChanged(onStateChanged);
}

function onStateChanged(user) {
    if (user) {

        var avatarURL = new Array("assets/img/avatar.png", "assets/img/avatar2.png", "assets/img/avatar3.png", "assets/img/avatar4.png", "assets/img/avatar5.png");
        var randomNum = Math.floor(Math.random() * avatarURL.length);

        var email = firebase.auth().currentUser.email;
        var name = email.split("@");

        var userProfile = { email: '', name: '', photoURL: '' };
        userProfile.email = firebase.auth().currentUser.email;
        userProfile.photoURL = avatarURL[randomNum];
        userProfile.name = name[0];


        var db = firebase.database().ref('users');
        var flag = false;
        db.on('value', function(users) {
            users.forEach(function(data) {
                var users = data.val();
                if (users.email === userProfile.email) {
                    currentUserKey = data.key;
                    document.getElementById('imgProfile').src = users.photoURL;
                    flag = true;
                }
            });

            if (flag === false) {
                firebase.database().ref('users').push(userProfile, callback);
            } else {
                document.getElementById('lnkSignOut').style = '';
            }

            document.getElementById('lnkNewChat').classList.remove('disabled');
            LoadChatList();

        });


    } else {
        window.location.href = "login.html";
    }
}


function callback(error) {

    if (error) {
        alert(error);
    } else {


    }

}

//////////
// Call auth  State changed
onFirebaseStateChanged();