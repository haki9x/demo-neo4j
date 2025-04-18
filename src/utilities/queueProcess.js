import $ from 'jquery';
export const queueProcessCommon = () => {
    return $.queueProcess = {
        _timer: null,
        _queue: [],
        add: function (fn, context, time) {
            var setTimer = function (time) {
                $.queueProcess._timer = setTimeout(function () {
                    time = $.queueProcess.add();
                    if ($.queueProcess._queue.length) {
                        setTimer(time);
                    }
                }, time || 0);
            }
            if (fn) {
                $.queueProcess._queue.push([fn, context, time]);
                if ($.queueProcess._queue.length >= 1) {
                    setTimer(time);
                }
                return;
            }

            var next = $.queueProcess._queue.shift();
            if (!next) {
                return 0;
            }
            //next[0].call(next[1] || window);
            next[0](next[1] || window);
            return next[2];
        },
        clear: function () {
            clearTimeout($.queue._timer);
            $.queueProcess._queue = [];
        }
    };
}
