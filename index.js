var client = AgoraRTC.createClient({mode: "rtc", codec: "vp8"});

var localTracks = {
    videoTrack: null,
    audioTrack: null
};

var localTrackState = {
    videoTrackEnabled: true,
    audioTrackEnabled: true
};

var remoteUsers = {};

var options = {
    appID: "e7b146a7f9c14354b5d300a905508bd4",
    channel: null,
    uid: null,
    token: null
};

$("#join-form").submit(async function (formSubmit) {
    formSubmit.preventDefault();
    options.appID = "e7b146a7f9c14354b5d300a905508bd4";
    options.channel = $("#channel-name").val();
    await join();
});

async function join() {
    client.on("user-published", handleUserPublished);
    client.on("user-joined", handleUserJoined);
    client.on("user-left", handleUserLeft);
    $("#leave").attr("disabled", false);
    $("#join").attr("disabled", true);
    $("#mic-btn").attr("disabled", false);
    $("#video-btn").attr("disabled", false);
    $("#share-screen-btn").attr("disabled", false);
    $("#whiteboard-btn").attr("disabled", false);
    options.uid = await client.join(options.appID, options.channel, null, null);
    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
    await client.publish(Object.values(localTracks));
    localTracks.videoTrack.play("local-player");
    const displayName = $("#display-name").val()
    const localPlayer = $(`
        <div id="player-wrapper-${displayName}">
        <p class="player-name">${displayName}</p>
        <div id="player-${displayName}" class="player"></div>
        </div>
        `);
    
}

function handleUserJoined(user) {
    const id = $("#display-name").val();
    remoteUsers[id] = user;
}

function handleUserPublished(user, mediaType) {
    userPublished(user, mediaType);
}

async function userPublished(user, mediaType) {
    const id = $("#display-name").val();
    await client.subscribe(user, mediaType);
    if (mediaType === "video") {
        const remotePlayer = $(`
        <div id="player-wrapper-${id}">
        <p class="player-name">${id}</p>
        <div id="player-${id}" class="player"></div>
        </div>
        `)
        $("#remote-playerlist").append(remotePlayer);
        user.videoTrack.play(`player-${id}`);
    }
}

function handleUserLeft(user) {
    const id = user.id;
    delete remoteUsers[id];
    $(`#player-wrapper-${id}`).remove();
}

async function leave() {
    for (trackName in localTracks) {
        var track = localTracks[trackName];
        if (track) {
            track.stop();
            track.close();
            localTracks[trackName] = undefined;
        }
    }
    $("#remote-playerlist").html("");
    $("#leave").attr("disabled", true);
    $("#mic-btn").attr("disabled", true);
    $("#video-btn").attr("disabled", true);
    $("#share-screen-btn").attr("disabled", true);
    $("#whiteboard-btn").attr("disabled", true);
    $("#join").attr("disabled", false);
    await client.leave();
}

$("#leave").click(function () {
    leave();
});

$("#mic-btn").click(function () {
    if (localTrackState.audioTrackEnabled) {
        muteAudio();
    } else {
        unmuteAudio();
    }
});

$("#video-btn").click(function () {
    if (localTrackState.videoTrackEnabled) {
        muteVideo();
    } else {
        unmuteVideo();
    }
});

$("#share-screen-btn").click(function () {
    shareScreen();
});

async function muteAudio() {
    if (! localTracks.audioTrack) {
        return;
    }
    await localTracks.audioTrack.setEnabled(false);
    localTrackState.audioTrackEnabled = false;
    $("#mic-btn").text("Unmute Audio");
}

async function unmuteAudio() {
    if (! localTracks.audioTrack) {
        return;
    }
    await localTracks.audioTrack.setEnabled(true);
    localTrackState.audioTrackEnabled = true;
    $("#mic-btn").text("Mute Audio");
}

async function muteVideo() {
    if (! localTracks.videoTrack) {
        return;
    }
    await localTracks.videoTrack.setEnabled(false);
    localTrackState.videoTrackEnabled = false;
    $("#video-btn").text("Turn Camera On");
}

async function unmuteVideo() {
    if (! localTracks.videoTrack) {
        return;
    }
    await localTracks.videoTrack.setEnabled(true);
    localTrackState.videoTrackEnabled = true;
    $("#video-btn").text("Turn Camera Off");
}

async function shareScreen() {
    AgoraRTC.createScreenVideoTrack({
        encoderConfig: "1080p_1",
        optimizationMode: "detail"
    }).then(localScreenTrack => {
    });
    $("#share-screen-btn").text("Stop Screen Share");
}


