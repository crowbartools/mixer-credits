// Global Lists
appSettings = {
    rolling: false
}

userLists = {
    followList: [],
    hostedList: [],
    subscribedList: [],
    resubscribeList: []
}

jobTitles = {
    mainJobs: ["Directed By", "Produced By", "Original Story By", "Screenplay By", "Director of Photography", "Cast Supervisor", "Art Director"],
    otherJobs: ["Lead Visual Effects", "Lead Video Graphics", "Lead Sound Designer", "Stunt Coordinator", "Prop Maker", "Set Decorator", "Best Boy", "Gaffer", "Key Grip"]
}

// This subs to update channels from mixer.
function kickstarter(){
    // Change movie name to parameter set.
    var movieName = getParameter('movie') || 'The Adventures of Mixer';
    $('.movie').text(movieName);

    // Change font color to parameter set.
    $('.wrapper').css('color', getParameter('color'));

    // Get channel id and connect.
    $.getJSON( "https://Mixer.com/api/v1/channels/"+getParameter('username'), function( data ) {
        channelid = data.id;
        var ca = new carina.Carina().open();

        // Following
        ca.subscribe('channel:'+channelid+':followed', function (data) {
            if($.inArray(data.user['username'], userLists.followList) === -1 && data['following'] === true){
                console.log('Following: '+data.user['username'])
                userLists.followList.push(data.user['username']);
            }
        });
        // Hosting
        ca.subscribe('channel:'+channelid+':hosted', function (data) {
            if($.inArray(data.hoster["token"], userLists.hostedList) === -1){
                console.log('Hosted: '+data.hoster["token"]);
                userLists.hostedList.push(data.hoster["token"]);
            }
        });
        // Subscribing
        ca.subscribe('channel:'+channelid+':subscribed', function (data) {
            if($.inArray(data.user['username'], userLists.subscribedList) === -1){
                console.log('Subscriber: '+data.user['username']);
                userLists.subscribedList.push(data.user['username']);
            }
        });
        // Resubscribing
        ca.subscribe('channel:'+channelid+':resubShared', function (data) {
            if($.inArray(data.user['username'], userLists.resubscribeList) === -1){
                console.log('Resub: '+data.user['username']);
                userLists.resubscribeList.push(data.user['username']);
            }
        });

        // Connect to chat
        $.getJSON( "https://Mixer.com/api/v1/chats/"+channelid, function( data ) {
            var endpoints = data.endpoints
            mixerSocketConnect(endpoints, channelid);
        });
    });
}

// Sort users into role and push to page.
function userSorter(){
    // Assign main job roles.
    var mainJobCounter = 0
    for(job in jobTitles.mainJobs){
        if (mainJobCounter !== jobTitles.length){
            if(userLists.resubscribeList.length > 0){
                userAdder(userLists.resubscribeList[0], jobTitles.mainJobs[job]);
                userLists.resubscribeList.splice(0, 1);
                mainJobCounter++
            } else if (userLists.subscribedList.length > 0){
                userAdder(userLists.subscribedList[0], jobTitles.mainJobs[job]);
                userLists.subscribedList.splice(0, 1);
                mainJobCounter++
            } else if (userLists.followList.length > 0){
                userAdder(userLists.followList[0], jobTitles.mainJobs[job]);
                userLists.followList.splice(0, 1);
                mainJobCounter++
            } else if (userLists.hostedList.length > 0){
                userAdder(userLists.hostedList[0], jobTitles.mainJobs[job]);
                userLists.hostedList.splice(0, 1);
                mainJobCounter++
            }
        }
    }

    // Assign other job roles.
    var otherJobCounter = 0
    for(job in jobTitles.otherJobs){
        if (otherJobCounter !== jobTitles.length){
            if(userLists.resubscribeList.length > 0){
                userAdder(userLists.resubscribeList[0], jobTitles.otherJobs[job]);
                userLists.resubscribeList.splice(0, 1);
                otherJobCounter++
            } else if (userLists.subscribedList.length > 0){
                userAdder(userLists.subscribedList[0], jobTitles.otherJobs[job]);
                userLists.subscribedList.splice(0, 1);
                otherJobCounter++
            } else if (userLists.followList.length > 0){
                userAdder(userLists.followList[0], jobTitles.otherJobs[job]);
                userLists.followList.splice(0, 1);
                otherJobCounter++
            } else if (userLists.hostedList.length > 0){
                userAdder(userLists.hostedList[0], jobTitles.otherJobs[job]);
                userLists.hostedList.splice(0, 1);
                otherJobCounter++
            }
        }
    }

    // Extras
    if(userLists.resubscribeList.length > 0){
        extrasAdder(userLists.resubscribeList, 'Supporting Cast');
        userLists.resubscribeList = [];
    }
    if (userLists.subscribedList.length > 0){
        extrasAdder(userLists.subscribedList, 'Stunts')
        userLists.subscribedList = [];
    }
    if (userLists.followList.length > 0){
        extrasAdder(userLists.followList, "Extras")
        userLists.followList = [];
    }
    if (userLists.hostedList.length > 0){
        extrasAdder(userLists.hostedList, 'Catering');
        userLists.hostedList = [];
    }
}

// Adds user to page.
function userAdder(username, job){
    var template = `
        <div class="job">${job}</div>
        <div class="name">${username}</div>
    `;

    $('.cast').append(template);
}

// Extras and Supporting Cast
function extrasAdder(userArray, job){
    var jobTemplate = `
        <div class="job">${job}</div>
        <div class="extras"></div>
    `;
    $('.cast').append(jobTemplate);

    for(user in userArray){
        var username = userArray[user];

        var template = `
            <div class="extraName">${username}</div>
        `;
                
        $('.cast').append(template);
    }
}

// This starts the animation. Need to fire this on chat command.
function rollCredits(){
    // Set rolling to true.
    appSettings.rolling = true;

    // Fire function here to start the scrolling.
    userSorter();

    var maskHeight = $(document).height();
    var maskWidth = $(document).width();
    var creditsHeight = getHiddenElementHeight('.credits');


    $('.wrapper').fadeIn(1000);
    $('.wrapper').fadeTo("slow");
    $('.wrapper').fadeIn();
    $('.credits').css("bottom", "-" + (creditsHeight) + "px");
    $('.credits').show('slow');

    $('.credits').animate({
        bottom: maskHeight + "px"
    }, {
        duration: scrollTime(creditsHeight),
        complete: function () {
            $('.wrapper').fadeOut();
            $('.window').fadeOut();
            $('.credits').css("bottom", "-" + (creditsHeight) + "px");
            $('.cast').empty();

            // Completed. Set rolling to false;
            appSettings.rolling = false;
        },
        step: function (n, t) {
            var pos = $(this).position();
        }
    });


    //$('.wrapper').addClass('rollCredits');
}

// CHAT
// Connect to mixer Websocket
function mixerSocketConnect(endpoints, channelid){
    if ("WebSocket" in window){

       // Let us open a web socket
       var randomEndpoint = endpoints[Math.floor(Math.random()*endpoints.length)];
       var ws = new ReconnectingWebSocket(randomEndpoint);
       console.log('Connected to '+randomEndpoint);

       ws.onopen = function(){
          // Web Socket is connected, send data using send()
          var connector = JSON.stringify({type: "method", method: "auth", arguments: [channelid], id: 1});
          ws.send(connector);
          console.log('Connection Opened...');
       };

       ws.onmessage = function (evt){
        chat(evt);
       };

       ws.onclose = function(){
          // websocket is closed.
          console.log("Connection is closed...");
       };

    }else{
       // The browser doesn't support WebSocket
       console.error("Woah, something broke. Abandon ship!");
    }
}

// Chat Events
function chat(evt){
    var evtString = $.parseJSON(evt.data);
    var eventType = evtString.event;

    if (eventType == "ChatMessage"){
        var eventMessage = evtString.data;
        var chatPacket = eventMessage.message;
        var chatText = chatPacket.message[0].text;
        var username = eventMessage.user_name; // Username

		// Fireworks
		// See if user is streamer and said !rollcredits and credits are not already rolling.
		if ( username == getParameter('username') && chatText == "!rollcredits" && appSettings.rolling === false){
			rollCredits();
		}
    }
}

// Helper - Get url paramter
function getParameter(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// Get height of an element that is hidden.
function getHiddenElementHeight(element){
    var p = $(element).clone().css('display', 'none');
    $('body').append(p);
    var height = p.height();
    p.remove();
    return height;
}

// Calculating how long to scroll
function scrollTime(creditsHeight){
    // Convert credits to millisecond based on height.
    var credits = (creditsHeight / 40) * 1000;

    // If credits would take less than 30 seconds, set to 30. Else use calculated speed.
    if(credits >= 30000){
        console.log('Scrolling for '+ (credits / 1000) +' seconds.');
        return credits;
    } else {
        console.log('Scrolling for 30 seconds.')
        return 30000;
    }
};

// Run on Start
kickstarter();