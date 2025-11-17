import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import {JSDOM} from "jsdom"

function init() {
    dayjs.extend(relativeTime);
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
    if (!document) {
        const dom = new JSDOM()
        console.log("Invoking function")
        dom.window.document.addEventListener("load", init);
    } else {
        console.log("Invoking function")
        document.addEventListener("DOMContentLoaded", init)
    }
})()