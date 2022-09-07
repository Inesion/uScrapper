const puppeteer = require('puppeteer')
const LOG_URL = "https://auth.univ-lorraine.fr/login?service=https:%2F%2Fent.univ-lorraine.fr%2FLogin%3FrefUrl%3D%2F";
const creds = require('./creds.json');

var scraped_data = {};

(async () => {
    const browser = await puppeteer.launch({ headless: false }); // default is true
    const page = await browser.newPage();
    await page.goto(LOG_URL);
    await page.waitForSelector('#username');
    await page.waitForSelector('#password');
    console.log('Log page loaded');
    await page.$eval('#username', (el, creds) => el.value = creds.username, creds);
    await page.$eval('#password', (el, creds) => el.value = creds.password, creds);
    console.log('Credentials typed in');
    await page.screenshot({ path: 'example.png' });
    await page.waitForSelector('#fm1 > input.btn.btn-block.btn-submit');
    await page.screenshot({ path: 'example2.png' });
    await page.click('#fm1 > input.btn.btn-block.btn-submit');
    await page.screenshot({ path: 'example3.png' });
    console.log('Log in button clicked\nWaiting for main page to load...');
    await page.waitForSelector('.nonLus');
    console.log('Main page loaded\nWaiting for mail tick to load...');
    await page.waitForFunction('document.querySelector(".nonLus").innerText != "?"');
    scraped_data.unread_mail = await (await page.$('.nonLus')).evaluate(el => el.textContent);
    console.log('Mail tick loaded : ' + scraped_data.unread_mail + ' mail(s) non lus.');

    const archePage = await getNewPageAfterClick(page, browser, '#liste-service1 > div:nth-child(3) > div > a.square-size-element');
    await handleArchePage(archePage);

    // const mailPage = await getNewPageAfterClick(page, browser, '#liste-service1 > div:nth-child(1) > div > a.square-size-element');
    // await handleMail(mailPage);

    // const shitAgendaPage = await getNewPageAfterClick(page, browser, '#liste-service2 > div.d-lg-none.col-6.col-sm-3.col-lg-2.px-1.mx-0.color2.draggable > div > a.square-size-element');
    // await handleShitAgenda(shitAgendaPage);

    await page.waitForSelector('.asdfadasfdsafsfd');

    await browser.close();
})();

async function getNewPageAfterClick(page, browser, selector) {
    //save target of original page to know that this was the opener:     
    const pageTarget = page.target();
    //execute click on first tab that triggers opening of new tab:
    await page.click(selector);
    console.log('Button clicked, opening new page...');
    //check that the first page opened this new page:
    const newTarget = await browser.waitForTarget(target => target.opener() === pageTarget);
    //get the new page object:
    const newPage = await newTarget.page();

    return newPage;
}

async function handleArchePage(archePage) {
    
}

async function handleShitAgenda(agendaPage) {
    ////console.log('fuck you agenda ' + agendaPage);
    await agendaPage.waitForNetworkIdle();
    console.log('fuck you too');
}

async function handleMail(mailPage) {
    console.log('fuck you mail');
    await mailPage.close();
}