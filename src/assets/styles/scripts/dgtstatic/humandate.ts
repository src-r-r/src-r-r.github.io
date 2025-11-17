import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"
export function humanDate(date : Date) {
    dayjs.extend(relativeTime);
    return dayjs().to(date);
}

function init() {

}