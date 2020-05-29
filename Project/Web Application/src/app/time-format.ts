class TIME_MAXIMUM
{
    public static SEC = 60;
    public static MIN = 60;
    public static HOUR = 24;
    public static DAY = 30;
    public static MONTH = 12;
}

export class TimeFormat
{
    public static  formatTimeString(tempDate: Date): String{
        const curTime = new Date().getTime();

        const regTime = tempDate.getTime();

        let diffTime = (curTime - regTime) / 1000;

        let msg: String = null;

        if (diffTime < 10) {
            // sec
            msg = '방금 전';
        } else if (diffTime < TIME_MAXIMUM.SEC) {
            // sec
            msg = Math.floor(diffTime) + '초 전';
        } else if ((diffTime /= TIME_MAXIMUM.SEC) < TIME_MAXIMUM.MIN) {
            // min
            msg = Math.floor(diffTime) + '분 전';

        } else if ((diffTime /= TIME_MAXIMUM.MIN) < TIME_MAXIMUM.HOUR) {
            // hour
            msg = Math.floor(diffTime) + '시간 전';
        } else if ((diffTime /= TIME_MAXIMUM.HOUR) < TIME_MAXIMUM.DAY) {
            // day
            msg = Math.floor(diffTime) + '일 전';
        } else if ((diffTime /= TIME_MAXIMUM.DAY) < TIME_MAXIMUM.MONTH) {
            // day
            msg = Math.floor(diffTime) + '달 전';
        } else {
            msg = Math.floor(diffTime) + '년 전';
        }
        return msg;

    }
}
