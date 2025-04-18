export function queueProcessCommon() {
  // Tạo một đối tượng queue với các phương thức add, clear
  const queue = {
    _timer: null as number | null,
    _queue: [] as [Function, any, number][],
    // Phương thức add thêm task vào hàng đợi
    add(fn?: Function, context?: any, time?: number) {
      const setTimer = (time?: number) => {
        this._timer = window.setTimeout(() => {
          this.add(); // Thực hiện task tiếp theo trong hàng đợi
          if (this._queue.length) {
            setTimer(time); // Tiếp tục đặt timer cho task tiếp theo
          }
        }, time || 0);
      };

      if (fn) {
        // Thêm task vào hàng đợi
        this._queue.push([fn, context, time || 0]);

        // Khởi động timer nếu hàng đợi có task
        if (this._queue.length >= 1) {
          setTimer(time);
        }
        return;
      }

      // Thực thi task tiếp theo
      const next = this._queue.shift();
      if (!next) {
        return 0; // Không còn task nào
      }

      // Thực thi hàm với context
      // next[0].call(next[1] || window);
      // next[0].call(null, next[1]);
      next[0](next[1] || window);
      // return next[2];
      return next[2]; // Trả về thời gian cho lần gọi tiếp theo
    },

    // Phương thức clear để xóa hàng đợi
    clear() {
      if (this._timer !== null) {
        clearTimeout(this._timer);
        this._timer = null; // Reset timer
      }
      this._queue = []; // Xóa hàng đợi
    }
  };

  return queue; // Trả về đối tượng queue có phương thức add, clear
}
// Sử dụng setupQueueProcess
// const queueProcess = setupQueueProcess(); // Khởi tạo hàng đợi
// Thêm các task vào hàng đợi
// queueProcess.add(() => console.log('Task 1'), null, 1000); // Thực thi sau 1 giây
// queueProcess.add(() => console.log('Task 2'), null, 500);  // Thực thi sau 0.5 giây
// queueProcess.add(() => console.log('Task 3'), null, 1500); // Thực thi sau 1.5 giây
