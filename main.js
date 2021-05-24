const puppeteer = require("puppeteer");

let page;
let cVideos = 0;

async function fn(){
    try {
        const browser = await puppeteer
            .launch({
                headless: false,
                defaultViewport: null,
                args: ["--start-maximized"],
            })
        let pages = await browser.pages();
        page = pages[0];

        // go to youtube playlist
        await page.goto("https://www.youtube.com/playlist?list=PLzkuLC6Yvumv_Rd5apfPRWEcjf9b1JRnq",{waitUntil:"networkidle2"});
        
        // fetch array containing noOfVideos and noOfViews and extract.
        await page.waitForSelector("#stats>.style-scope.ytd-playlist-sidebar-primary-info-renderer", { visible: true });
        await page.waitForSelector("h1#title",{ visible: true });
        let obj = await page.evaluate(function() {
            let allelements = document.querySelectorAll("#stats>.style-scope.ytd-playlist-sidebar-primary-info-renderer");
            let noofVideos = allelements[0].innerText;
            let noOfViews = allelements[1].innerText;
            let title = document.querySelector("h1#title").innerText;         // fetch title of playlist
            let obj = {
                nfVideos: noofVideos,
                nfViews: noOfViews,
                title
            }
            return obj;
        });
        
        // get noOfVideos in numerical form
        let noOfVideos = obj.nfVideos.split(" ")[0];
        noOfVideos = Number(noOfVideos);

        console.log(obj)

        // fetch video-title array and duration array
        let videoSelector = "#video-title";
        let duration = "span.style-scope.ytd-thumbnail-overlay-time-status-renderer";
        await page.waitForSelector("#video-title", { visible: true });
        await page.waitForSelector("span.style-scope.ytd-thumbnail-overlay-time-status-renderer", { visible: true });
        let titleDurArr = await page.evaluate(getTitleNDuration,videoSelector, duration);
        console.table(titleDurArr);
    }
    catch (err) {
        console.log(err);
    }
}

// duration, title array 
function getTitleNDuration(videoSelector,duration) {
    let titleElementsArr = document.querySelectorAll(videoSelector);
    let durationElementArr = document.querySelectorAll(duration);
    let titleDurArr = [];                                          // array of objects of title,duration
    for (let i = 0; i < durationElementArr.length; i++) {
        let title = titleElementsArr[i].innerText;
        let duration = durationElementArr[i].innerText.trim();
        titleDurArr.push({ title, duration })
    }
    return titleDurArr;
}


fn();

