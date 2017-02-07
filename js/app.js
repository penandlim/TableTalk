(function () {
  "use strict";
    var request = new XMLHttpRequest();
    request.open('GET', 'https://klatelbat.com:12345/getMSGThreads', true);
    console.log("loading..");
    request.onload = function() {
        if (this.status === 200) {
            var jsonResponse = JSON.parse(this.responseText);
            for (var i = 0; i < jsonResponse.length; i++) {
                var new_word = document.createElement("div");
                new_word.className = "word";
                new_word.setAttribute("_lat", jsonResponse[i].lat);
                new_word.setAttribute("_lng", jsonResponse[i].lon);
                new_word.setAttribute("_pop", jsonResponse[i].pop);
                new_word.setAttribute("_id", jsonResponse[i].mongoID);
                new_word.setAttribute("_latestMessage", jsonResponse[i].latestMessage);
                new_word.innerText = jsonResponse[i].messageHeading;
                new_word.addEventListener("click", loadMessages);
                document.getElementById("words").appendChild(new_word);
                console.log("done!");
            }
        }
        else {
            console.log('Request failed.  Returned status of ' + this.status);
        }
    };
    
    request.send();

    
document.getElementById("send").addEventListener("click", sendMessage);
document.getElementById("create").addEventListener("click", createThread);
document.getElementById("chatLog").addEventListener("click", closeChatLog);

function closeChatLog() {
    document.getElementById('chatLog').style.display = "none";
    document.getElementById('send').disabled = true;
    document.getElementById('create').disabled = false; 
}

function loadMessages() {
    document.getElementById('send').disabled = false;
    document.getElementById('create').disabled = true; 
    document.getElementById('chatLog').style.display = "block";

    document.getElementById('chatLog').innerHTML = "";

    var request = new XMLHttpRequest();
    var url = "https://klatelbat.com:12345/getMSGThreadMessages/" + this.getAttribute("_id");
    var save = this.getAttribute("_id");
    request.open('GET', url, true);
    request.withCredentials = false;
    request.onload = function() {
        if (this.status === 200) {
            var jsonResponse = JSON.parse(this.responseText);
            for (var i = 0; i < jsonResponse.length; i++) {
                var new_message = document.createElement("h2");
                new_message.className = "message";
                new_message.innerText = jsonResponse[i].msg;
                document.getElementById("chatLog").appendChild(new_message);
                document.getElementById("typeBox").setAttribute("_msgId",  save);
            }
        }
        else {
            alert('Request failed.  Returned status of ' + this.status);
        }
    };
    request.send();
}

function sendMessage() {
  var data = JSON.stringify({
  "msg": document.getElementById("typeBox").value,
  "msgID": document.getElementById("typeBox").getAttribute("_msgId")
  });

  var xhr = new XMLHttpRequest();
  xhr.withCredentials = false;

  xhr.addEventListener("readystatechange", function () {
  
    console.log(this.responseText);
    var new_message = document.createElement("h2");
    new_message.className = "message";
    new_message.innerText = document.getElementById("typeBox").value;
    document.getElementById("chatLog").appendChild(new_message);
    document.getElementById("typeBox").value = "";  
  });

  xhr.open("POST", "https://klatelbat.com:12345/newMSG/post");
  xhr.setRequestHeader("content-type", "application/json");

  xhr.send(data);
}

function createThread() {
  var title = document.getElementById("typeBox").value;
  var lat = positionCurrent.lat;
  var lng = positionCurrent.lng;

  var data = JSON.stringify({
    "msgHead": title,
    "lat": lat, 
    "lon": lng
  });

  var request = new XMLHttpRequest();
  request.withCredentials = false;

  request.addEventListener("readystatechange", function() {
    if(this.readyState == 4) {
      console.log(this.responseText);
      var jsonResponse = JSON.parse(this.responseText);

      //show the new word to represent thread
      var newWord = document.createElement("div");
      newWord.className = "word";
      newWord.setAttribute("_lat", lat);
      newWord.setAttribute("_lng", lng);
      newWord.setAttribute("_pop", 0);
      newWord.setAttribute("_id", jsonResponse.mongoID);
      newWord.setAttribute("_latestMessage", jsonResponse.latestMessage);
      newWord.innerText = title;
      newWord.addEventListener("click", loadMessages);
      document.getElementById("words").appendChild(newWord);
    }
  });

  request.open("POST", "https://klatelbat.com:12345/newmsgthread/post");
  request.setRequestHeader("content-type", "application/json");
  request.setRequestHeader("cache-control", "no-cache");
  request.send(data);
}

    //set to true for debugging output
  var debug = false;

  // our current position
  var positionCurrent = {
    lat: null,
    lng: null,
    hng: null
  };


  // elements that ouput our position
  var positionLat = document.getElementById("position-lat");
  var positionLng = document.getElementById("position-lng");
  var positionHng = document.getElementById("position-hng");


  // // debug outputs
  // var debugOrientation = document.getElementById("debug-orientation");
  // var debugOrientationDefault = document.getElementById("debug-orientation-default");
  //
  //
  // // info popup elements, pus buttons that open popups
  // var popup = document.getElementById("popup");
  // var popupContents = document.getElementById("popup-contents");
  // var popupInners = document.querySelectorAll(".popup__inner");
  // var btnsPopup = document.querySelectorAll(".btn-popup");


  // buttons at the bottom of the screen
  // var btnLockOrientation = document.getElementById("btn-lock-orientation");
  // var btnNightmode = document.getElementById("btn-nightmode");
  // var btnMap = document.getElementById("btn-map");
  // var btnInfo = document.getElementById("btn-info");


  // if we have shown the heading unavailable warning yet
  var warningHeadingShown = false;


  // switches keeping track of our current app state
  var isOrientationLockable = false;
  var isOrientationLocked = false;
  var isNightMode = false;


  // the orientation of the device on app load
  var defaultOrientation;


  // browser agnostic orientation
  function getBrowserOrientation() {
    var orientation;
    if (screen.orientation && screen.orientation.type) {
      orientation = screen.orientation.type;
    } else {
      orientation = screen.orientation ||
                    screen.mozOrientation ||
                    screen.msOrientation;
    }

    /*
      'portait-primary':      for (screen width < screen height, e.g. phone, phablet, small tablet)
                                device is in 'normal' orientation
                              for (screen width > screen height, e.g. large tablet, laptop)
                                device has been turned 90deg clockwise from normal

      'portait-secondary':    for (screen width < screen height)
                                device has been turned 180deg from normal
                              for (screen width > screen height)
                                device has been turned 90deg anti-clockwise (or 270deg clockwise) from normal

      'landscape-primary':    for (screen width < screen height)
                                device has been turned 90deg clockwise from normal
                              for (screen width > screen height)
                                device is in 'normal' orientation

      'landscape-secondary':  for (screen width < screen height)
                                device has been turned 90deg anti-clockwise (or 270deg clockwise) from normal
                              for (screen width > screen height)
                                device has been turned 180deg from normal
    */

    return orientation;
  }

    // Converts from degrees to radians.
    Math.radians = function(degrees) {
        return degrees * Math.PI / 180;
    };

    // Converts from radians to degrees.
    Math.degrees = function(radians) {
        return radians * 180 / Math.PI;
    };

    // called on device orientation change
    function onHeadingChange(event) {
        var heading = event.alpha;

        if (typeof event.webkitCompassHeading !== "undefined") {
            heading = event.webkitCompassHeading; //iOS non-standard
        }

        var orientation = getBrowserOrientation();

        if (typeof heading !== "undefined" && heading !== null) { // && typeof orientation !== "undefined") {
            // we have a browser that reports device heading and orientation

            // what adjustment we have to add to rotation to allow for current device orientation
            var adjustment = 0;
            if (defaultOrientation === "landscape") {
                adjustment -= 90;
            }

            if (typeof orientation !== "undefined") {
                var currentOrientation = orientation.split("-");

                if (defaultOrientation !== currentOrientation[0]) {
                    if (defaultOrientation === "landscape") {
                        adjustment -= 270;
                    } else {
                        adjustment -= 90;
                    }
                }

                if (currentOrientation[1] === "secondary") {
                    adjustment -= 180;
                }
            }

            positionCurrent.hng = heading + adjustment;
            var phase = positionCurrent.hng < 0 ? 360 + positionCurrent.hng : positionCurrent.hng;
            positionHng.textContent = (360 - phase | 0) + "°";


            // // apply rotation to compass rose
            // if (typeof rose.style.transform !== "undefined") {
            //     rose.style.transform = "rotateZ(" + positionCurrent.hng + "deg)";
            // } else if (typeof rose.style.webkitTransform !== "undefined") {
            //     rose.style.webkitTransform = "rotateZ(" + positionCurrent.hng + "deg)";
            // }
            var words = document.getElementsByClassName("word");
            var lng1 = Math.radians(positionCurrent.lng);
            var lat1 = Math.radians(positionCurrent.lat);
            for (var i = 0; i < words.length; ++i) {
                var item = words[i];
                var lng2 = Math.radians(item.getAttribute("_lng"));
                var lat2 = Math.radians(item.getAttribute("_lat"));
                var y = Math.sin(lng2-lng1) * Math.cos(lat2);
                var x = Math.cos(lat1)*Math.sin(lat2) -
                    Math.sin(lat1)*Math.cos(lat2)*Math.cos(lng2-lng1);
                var brng = Math.degrees(Math.atan2(y, x));

                var angle = positionCurrent.hng - brng;

                var radius_earth = 6371e3; // metres
                var delta_lat = lat2-lat1;
                var delta_lng = lng2-lng1;

                var a = Math.sin(delta_lat/2) * Math.sin(delta_lat/2) +
                    Math.cos(lat1) * Math.cos(lat2) *
                    Math.sin(delta_lng/2) * Math.sin(delta_lng/2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

                var distance = radius_earth * c;
                if (distance < 1) {
                    distance = 1;
                }
                // Distance Debug
                // item.innerText = parseInt(distance) + "m";

                // Apply corresponding font effects.
                item.style.fontSize = (90 + (item.getAttribute("_pop") * 10)) + "%";
                var isCloseToInteractWith;
                if (distance <= 10) {
                    item.style.color = "white";
                    item.style.fontSizeAdjust = "1.2";
                    isCloseToInteractWith = true;
                } else {
                    item.style.color = "#A9A9A9";
                    item.style.fontSizeAdjust = "1.0";
                    isCloseToInteractWith = false;
                }


                // Apply correct transforms
                if (typeof item.style.transform !== "undefined") {
                    item.style.transform = "rotateZ(" + (-1 * angle) + "deg)";
                    item.style.transformOrigin = "50% 200px";
                    item.style.transform += "translate(0px, " + ((distance / -0.2) - (!isCloseToInteractWith * 50)) + "px)";
                } else if (typeof item.style.webkitTransform !== "undefined") {
                    item.style.webkitTransform = "rotateZ(-" + (-1 * angle) + "deg)";
                    item.style.webkitTransformOrigin = "50% 200px";
                    item.style.webkitTransform += "translate(0px, " + ((distance / -0.2) - (!isCloseToInteractWith * 50))  + "px)";
                }
 


                //making new topics glow potentialls 
                /*
                var prevLatestMessage = item.getAttribute("latestMessage");
                watch(locationUpdate, function(){
                  var newLatestMessage = item.getAttribute("latestMessage");
                  if(prevLatestMessage < newLatestMessage) {
                    item.style.boxShadow = "0 0 10px";
                    prevLatestMessage = newLatestMessage; 
                  }
                }) 
                */        
            }

        } else {
            positionHng.textContent = "n/a";
            showHeadingWarning();
        }
    }

    function showHeadingWarning() {
        if (!warningHeadingShown) {
            console.log("No orientation!");
            warningHeadingShown = true;
        }
    }

  function onFullscreenChange() {
    if (isOrientationLockable && getBrowserFullscreenElement()) {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock(getBrowserOrientation()).then(function () {
        }).catch(function () {
        });
      }
    } else {
      lockOrientationRequest(false);
    }
  }

  function toggleOrientationLockable(lockable) {
    isOrientationLockable = lockable;
  }

  function checkLockable() {
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock(getBrowserOrientation()).then(function () {
        toggleOrientationLockable(true);
        browserUnlockOrientation();
      }).catch(function (event) {
        if (event.code === 18) { // The page needs to be fullscreen in order to call lockOrientation(), but is lockable
          toggleOrientationLockable(true);
          browserUnlockOrientation(); //needed as chrome was locking orientation (even if not in fullscreen, bug??)
        } else {  // lockOrientation() is not available on this device (or other error)
          toggleOrientationLockable(false);
        }
      });
    } else {
      toggleOrientationLockable(false);
    }
  }

  function lockOrientationRequest(doLock) {
    if (isOrientationLockable) {
      if (doLock) {
        browserRequestFullscreen();
        lockOrientation(true);
      } else {
        browserUnlockOrientation();
        browserExitFullscreen();
        lockOrientation(false);
      }
    }
  }

  function lockOrientation(locked) {
    if (locked) {
      btnLockOrientation.classList.add("active");
    } else {
      btnLockOrientation.classList.remove("active");
    }

    isOrientationLocked = locked;
  }

  function toggleOrientationLock() {
    if (isOrientationLockable) {
      lockOrientationRequest(!isOrientationLocked);
    }
  }

  function locationUpdate(position) {
    positionCurrent.lat = position.coords.latitude;
    positionCurrent.lng = position.coords.longitude;

    positionLat.textContent = positionCurrent.lat;
    positionLng.textContent = positionCurrent.lng;
  }

  function locationUpdateFail(error) {
    positionLat.textContent = "n/a";
    positionLng.textContent = "n/a";
    console.log("location fail: ", error);
  }

    if (screen.width > screen.height) {
        defaultOrientation = "landscape";
    } else {
        defaultOrientation = "portrait";
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    document.addEventListener("mozfullscreenchange", onFullscreenChange);
    document.addEventListener("MSFullscreenChange", onFullscreenChange);
    window.addEventListener("deviceorientation", onHeadingChange);

  navigator.geolocation.watchPosition(locationUpdate, locationUpdateFail, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 30000 //large timeout to accomodate slow GPS lock on some devices
  });
  checkLockable();

}());
