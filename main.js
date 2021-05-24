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
        
        // fetch array containing noOfVideos and noOfViews 
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
        
        // first of all we have to scroll down until data finished so that everything rendered successfully
        // then we will extract data.
        // noOFVideos = 783, page render 100 videos at a time. so we need atleast 7 scrolls (783/100)
        // cVideos = 0 : no of videos rendered till scroll
        let i = 0;
        while ((noOfVideos - cVideos) > 100) {
            await scrollDown(page);
            console.log(i);
            i++;
        }
        // await page.waitForNavigation({ waitUntil: "networkidle0" });
        // 83 
        await waitTillHTMLRendered(page);
        await scrollDown();
        console.log(cVideos);


        // now we can select all videos
        // fetch video-title and duration from all the videos
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

// scroll
async function scrollDown() {
    let length = await page.evaluate(function(){
        let titleElems = document.querySelectorAll("#video-title");   // fetch all rendered videos till that moment.
        titleElems[titleElems.length-1].scrollIntoView(true);       // target the last video and scroll till that video.
        return titleElems.length;
    });
    cVideos = length;          // update the cVideos
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

