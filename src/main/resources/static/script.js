$('.result').hide();

const roomId = window.location.href.split("/", -1)[4];

$.ajax({
    type: 'get',
    url: '/init',
    data: {roomId: roomId},
    dataType: 'json',
    error: function (error) {
        alert("initError" + " " + error);
        console.log(error);
    },
    success: showBoard
});

function showBoard(response) {
    for (position in response) {
        const pieceName = response[position];
        if (pieceName === '.') {
            continue;
        }
        document.getElementById(position).classList.add(pieceName);
    }
    setTimeout(() => status(), 0);
}

let startPosition = '';
$('.cell').click(function () {
    const targetPosition = $(this).attr('id');
    if (startPosition === '') {
        startPosition = targetPosition;
    } else {
        requestMove(startPosition, targetPosition);
        startPosition = '';
    }
});

function requestMove(start, target) {
    $.ajax({
        type: 'put',
        url: '/move',
        data: {roomId: roomId, start: start, target: target},
        dataType: 'json',
        error: function (response) {
            alert(response.responseText);
        },
        success: function () {
            move({start: start, target: target});
        }
    })
}

function move(position) {
    let startPositionClassName = getChessPieceClassName(position.start);
    let targetPositionClassName = getChessPieceClassName(position.target);

    if (targetPositionClassName !== '') {
        getClassList(position.target).remove(targetPositionClassName);
    }
    getClassList(position.start).remove(startPositionClassName);
    getClassList(position.target).add(startPositionClassName);
    setTimeout(() => checkKingDie(), 0);
    setTimeout(() => status(), 0);
}

function getChessPieceClassName(position) {
    let className = document.getElementById(position).className;
    return className.substring(className.lastIndexOf("cell") + 5, className.length);
}

function getClassList(position) {
    return document.getElementById(position).classList
}

function checkKingDie() {
    $.ajax({
        type: 'get',
        url: '/isEnd',
        data: {roomId: roomId},
        dataType: 'json',
        error: function (error) {
            alert("isEnd Error" + error);
            console.log(error);
        },
        success: function (response) {
            if (!response.isEnd) {
                return;
            }
            $('.result').show();

            $('.result > .message').html(`${response.winningTeam}팀 승리!`);

            $('.result > .submit').click(function () {
                restart();
                $('.result').hide();
            })
        }
    })
}

$('.reload').click(() => {
    restart();
});

$('.exit').click(() => {
    $.ajax({
        type: 'get',
        url: '/exit',
        error: function (request, error, status) {
            alert(request.status + "\n" + error + "\n" + status);
        },
        success: function () {
            window.location.href = '/';
        }
    });
});


function restart() {
    $.ajax({
        type: 'get',
        url: '/restart',
        data: {roomId: roomId},
        dataType: 'json',
        error: function (request, status, error) {
            alert(request.status + "\n" + request.responseText + "\n" + error + "\n" + status);
        },
        success: function (response) {
            setTimeout(() => remove(response), 0);
            setTimeout(() => showBoard(response), 0);
        }
    });
}

function remove(response) {
    for (position in response) {
        const className = getChessPieceClassName(position);
        if (className !== '') {
            getClassList(position).remove(className);
        }
    }
}

function status() {
    $.ajax({
        type: 'get',
        url: '/status',
        data: {roomId: roomId},
        dataType: 'json',
        error: function () {
            alert("status Error")
        },
        success: function (response) {
            $('.left > .score').html(response.whiteTeamScore);
            $('.right > .score').html(response.blackTeamScore);
        }
    })
}
