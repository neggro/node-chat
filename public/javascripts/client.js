(function ($) {

    var joined = false,
        nickName,
        room,
        $chatScreen = $('#chat-screen'),
        $roomText = $('#room-text'),
        $roomSelect = $('#room-select'),
        $nickName = $('#nick-name'),
        selectedRoom,
        $roomConnectBtn = $('#room-connect-btn'),
        messageTemplate = '<p><em>{from}: </em>{message}</p>',

        makeRandom = function () {
            return Math.floor(Math.random() * 99999);
        },

        bindEvents = function () {
            $('#nick-name-form').on('submit', function (e) {
                e.preventDefault();
                if (!room) {
                    nickName = $nickName.val();
                    if (!nickName) {
                        nickName = 'user_' + makeRandom();
                    }
                    room = io.connect('/room');
                    manageRoom();
                } else {
                    room.emit('leave', selectedRoom);
                }
            });

            $('#room-join').on('click', function (e) {
                selectedRoom = $roomSelect.val();
                room.emit('join room', selectedRoom);
            });

            $('#room-form').on('submit', function (e) {
                e.preventDefault();
                if (joined) {
                    var msg = $.trim($roomText.val());
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
                $('#room-form').css('display', 'block');
                $chatScreen.append(
                    messageTemplate
                        .replace('{from}', 'From server')
                        .replace('{message}', nickName + ' connected.')
                )[0].scrollTop = 999999;
                $nickName.val(nickName).attr('readonly', true);
                $roomConnectBtn.text('Disconnect').addClass('btn-danger');
            });

            room.on('joined', function (msg) {
                joined = true;
                $chatScreen.append(
                    messageTemplate.replace('{from}', 'From server')
                        .replace('{message}', msg)
                )[0].scrollTop = 999999;
            });

            room.on('message', function (data) {
                var parsedData = JSON.parse(data);
                $chatScreen.append(
                    messageTemplate.replace('{from}', parsedData.from)
                        .replace('{message}', parsedData.msg)
                )[0].scrollTop = 999999;
            });

            room.on('leave room', function (data) {
                alert(data);
            });
        };

    bindEvents();

})(jQuery);
