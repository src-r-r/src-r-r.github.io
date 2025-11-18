import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime);

function init() {
    const itemDates = document.getElementsByClassName("item-date");
    console.debug("Changing %d dates", itemDates.length)
    let dateStr : string;
    for (let i = 0; i < itemDates.length; ++i) {
        if (!itemDates[i]) continue;
        dateStr = itemDates[i].textContent
        itemDates[i].textContent = dayjs().to(dayjs(dateStr));
    }
}

(function() {
    console.log("Invoking function")
    document.addEventListener("DOMContentLoaded", init)
})()