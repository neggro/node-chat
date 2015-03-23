(function ($) {

    var joined = false,
        nickName,
        room,
        $chatScreen = $('#chat-screen'),
        $roomText = $('#room-text'),
        $roomSelect = $('#room-select'),
        $nickName = $('#nick-name'),
        $roomForm = $('#room-form'),
        selectedRoom,
        $roomConnectBtn = $('#room-connect-btn'),
        messageTemplate = '<p><em><b>{from}</b>: </em>{message}</p>',

        makeRandom = function () {
            return Math.floor(Math.random() * 99999);
        },

        bindEvents = function () {

            $('#nick-name-form').on('submit', function (e) {

                e.preventDefault();

                if (!room || room.disconnected) {
                    nickName = $nickName.val();
                    if (!nickName) {
                        nickName = 'user_' + makeRandom();
                    }
                    if (!room) {
                        room = io.connect();
                        manageRoom();
                    } else {
                        room.open();
                    }
                    window.room = room;
                } else {
                    if (confirm('Are you sure?')) {
                        room.emit('leave', {
                            room: selectedRoom,
                            userName: nickName
                        });
                    }
                }
            });

            $('#room-join').on('click', function (e) {

                if (!joined) {

                    selectedRoom = $roomSelect.val();

                    room.emit('join room', {
                        room: selectedRoom,
                        userName: nickName
                    });
                } else {
                    $chatScreen.append(
                        messageTemplate.replace('{from}', 'From server')
                            .replace('{message}', 'You are already joined.')
                    )[0].scrollTop = 999999;
                }
            });

            $roomForm.on('submit', function (e) {

                var msg;

                e.preventDefault();

                if (joined) {

                    msg = $.trim($roomText.val());

                    if (msg) {

                        $roomText.val('');

                        $chatScreen.append(
                            messageTemplate.replace('{from}', 'From me')
                                .replace('{message}', msg)
                        )[0].scrollTop = 999999;

                        room.emit('fromclient', {
                            msg: msg,
                            from: nickName
                        });
                    }
                } else {
                    $chatScreen.append(
                        messageTemplate.replace('{from}', 'From server')
                            .replace('{message}', 'Please join a room first.')
                    )[0].scrollTop = 999999;
                }
            });
        },

        manageRoom = function () {

            room.on('connect', function () {

                $roomForm.show();

                $chatScreen.append(
                    messageTemplate
                        .replace('{from}', 'From server')
                        .replace('{message}', 'You are connected as <b>' + nickName + '</b>.')
                )[0].scrollTop = 999999;

                $nickName.val(nickName).attr('readonly', true);
                $roomConnectBtn.val('Disconnect').addClass('btn-danger');

                $('#message-box').hide();
                $('#room-selector').css('display', 'flex');
            });

            room.on('joined', function (msg) {

                joined = true;
                $chatScreen.append(
                    messageTemplate.replace('{from}', 'From server')
                        .replace('{message}', msg)
                )[0].scrollTop = 999999;

                $('#room-selector').hide();
                $('#message-box').css('display', 'flex');
            });

            room.on('message', function (data) {

                var parsedData = JSON.parse(data);
                $chatScreen.append(
                    messageTemplate.replace('{from}', parsedData.from)
                        .replace('{message}', parsedData.msg)
                )[0].scrollTop = 999999;
            });

            room.on('leave room', function (data) {

                var success = JSON.parse(data).success;

                if (success) {
                    room.close();
                    joined = false;
                    $roomForm.hide();
                    $nickName.attr('readonly', true);
                    $roomConnectBtn.val('Connect').removeClass('btn-danger');
                    $chatScreen.append(
                        messageTemplate.replace('{from}', 'From server')
                            .replace('{message}', 'You left the room.')
                    )[0].scrollTop = 999999;
                }
            });
        };

    bindEvents();

})(jQuery);
