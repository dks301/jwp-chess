$('.result').hide();

$.ajax({
    type: 'get',
    url: '/init',
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

function requestMove(startPosition, targetPosition) {
    $.ajax({
        type: 'post',
        url: '/move',
        data: {startPosition: startPosition, targetPosition: targetPosition},
        dataType: 'json',
        error: function (response) {
            alert(response.responseText);
        },
        success: function () {
            move({startPosition, targetPosition});
        }
    })
}

function move(position) {
    let startPositionClassName = getChessPieceClassName(position.startPosition);
    let targetPositionClassName = getChessPieceClassName(position.targetPosition);

    if (targetPositionClassName !== '') {
        getClassList(position.targetPosition).remove(targetPositionClassName);
    }
    getClassList(position.startPosition).remove(startPositionClassName);
    getClassList(position.targetPosition).add(startPositionClassName);
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
        dataType: 'json',
        error: function () {
            alert("isEnd Error")
        },
        success: function (response) {
            if (!response.isEnd) {
                return;
            }
            $('.result').show();
            $('.result > .message').html(response.message);
            $('.result > .submit').click(() => {
                restart();
            })
        }
    })
}

$('.reload').click(() => {
    restart();
});

$('.cancel').click(() => {
    startPosition = '';
});


function restart() {
    $.ajax({
        type: 'get',
        url: '/restart',
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
