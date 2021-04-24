const puppeteer = require('puppeteer');
const ScreenshotTester = require('puppeteer-screenshot-tester')
const { promisify } = require('util')
const sleep = promisify(setTimeout)

let url = process.env.WEBAPP_URL;
let temp_password = process.env.TEMP_PASSWORD;

(async () => {
    const test_screenshot = await ScreenshotTester(0.8, false, false, [], {
        transparency: 0.5
    })

    const test_collection_screenshot = await ScreenshotTester(
      0.1, // threshold
      false, // anti-aliasing
      false, // ignore colors
      {
          ignoreRectangles: [[36, 335, 169, 106], [649, 345, 372, 54], [568, 428, 170, 85] ],
      }, // rectangles
      {
          transparency: 0.5
      }
    )

    const test_screenshot_containing_video = await ScreenshotTester(
      0.1, // threshold
      false, // anti-aliasing
      false, // ignore colors
      {
          ignoreRectangles: [[670, 95, 583, 331], [648, 657, 403, 27]],
      }, // rectangles
      {
          transparency: 0.5
      }
    )

    const test_words_screenshot = await ScreenshotTester(
      0.1, // threshold
      false, // anti-aliasing
      false, // ignore colors
      {
          ignoreRectangles: [[670, 95, 583, 331], [648, 657, 403, 27], [15, 284, 610, 70]],
      }, // rectangles
      {
          transparency: 0.5
      }
    )

    console.log("Loading " + url)
    // Chromium doesn't support video playback, so use Chrome instead
    // uncomment this when testing on a laptop:
    // const browser = await  puppeteer.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true})
    const browser = await  puppeteer.launch({executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox']})
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 926 });
    await page.goto(url,  {waitUntil: 'networkidle0'});
    // Type in the username
    await page.type('input','s3sink@bigendiandata.com')
    // Type in the password
    await page.type('#app > div > div > div > div.Section__sectionBody___3DCrX > div:nth-child(2) > input', temp_password)
    // console.log("Validating auth form: "+await test_screenshot(page, 'screenshot00_authentication', {
    //     fullPage: true,
    // }))

    console.log("Page title: " + await page.title())
    console.log("Authenticating")
    // click Login button
    await Promise.all([
      page.click("button"),
      page.waitForTimeout(2000)
      // page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);

      // Are we on the password reset page?
      passwordHeaderSelector = "#app > div > div > div > div.Section__sectionHeader___13iO4"
      try {
        if (await page.$(passwordHeaderSelector) !== null) {
          console.log("found password reset form")
          // enter new password
          await page.type('#app > div > div > div > div.Section__sectionBody___3DCrX > div > input', temp_password)
          console.log("submitting new password")
          // click Submit button
          await Promise.all([
            page.click("button"),
            page.waitForTimeout(2000)
          ]);
        } else {
          console.log('Temporary password has already been reset.')
        }
      } catch(e) {
        console.log('Temporary password has already been reset.')
      }

    // Wait for catalog view to load
    console.log("Waiting 5s for catalog view to load")
    await page.waitForTimeout(5000)

    // Validate that the catalog table is not empty
    tableEmptyMessageSelector = "tbody > tr > td > div > div"
    try {
      if (await page.$(tableEmptyMessageSelector) !== null) {
        const text = await page.$eval(tableEmptyMessageSelector, el => el.textContent);
        if (text === 'There are no records to show') {
          throw new Error("There are no records to show.")
        }
      }
    } catch (e) {
      console.error(e)
      process.exit(-1)
    }

    // Validate that the workflow status for the first asset in the
    // table says, "Complete"
    console.log("Validating that the first asset's workflow is Complete")
    const assetWorkflowStatusSelector = "td.tableWordWrap:nth-child(3) > a:nth-child(1)"
    try {
      await page.waitForSelector(assetWorkflowStatusSelector, {polling:1000, timeout: 3000})
    } catch (e) {
      console.log('Missing expected asset workflow status.\n' + e)
    }
    try {
      const text = await page.$eval(assetWorkflowStatusSelector, el => el.textContent);
      if (text !== 'Complete') {
        console.log("Asset workflow status: " + text)
        throw new Error("Asset workflow status is not Complete")
      }
    } catch (e) {
      console.error(e)
      process.exit(-1)
    }

    // VALIDATE OBJECTS TAB
    console.log("Loading objects tab.")
    await page.click('tbody > tr:nth-child(1) > td:nth-child(6) > a');
    // wait until video loads
    const video_selector='#videoPlayer > div.vjs-control-bar > div.vjs-remaining-time.vjs-time-control.vjs-control > span.vjs-remaining-time-display'
    await page.waitForSelector(video_selector,  {polling:1000, timeout: 5000})
    // validate that object detection results are present
    console.log("Validating that object detection results are present.")
    const rounded_button_selector = '#app > div > div.container-fluid > div > div:nth-child(1) > div:nth-child(2) > div > div > div:nth-child(2) > div > button:nth-child(2)'
    try {
        if (await page.waitForSelector(rounded_button_selector) === null) {
          throw new Error("Missing object detection results")
        }
    } catch(e) {
        console.log(e)
    }

    // console.log("validating objects: "+await test_screenshot_containing_video(page, 'screenshot02_tab_objects',   {
    // fullPage: true,
    // }))


    // VALIDATE CELEBRITY TAB
    let tab_selector='#__BVID__28___BV_tab_button__'
    await page.click(tab_selector)
    try {
        await page.waitForSelector(rounded_button_selector, {timeout: 5000})
    } catch(e) {
        // no data in this tab
    }
    // console.log("validating celebrities: "+await test_screenshot_containing_video(page, 'screenshot03_tab_celebrities', {
    //     fullPage: true,
    // }))

    // VALIDATE MODERATION TAB
    tab_selector='#__BVID__30___BV_tab_button__'
    await page.click(tab_selector)
    try {
        await page.waitForSelector(rounded_button_selector, {timeout: 5000})
    } catch(e) {
        // no data in this tab
    }
    // console.log("validating moderation: "+await test_screenshot_containing_video(page, 'screenshot04_tab_moderation', {
    //     fullPage: true,
    // }))

    // VALIDATE FACES TAB
    tab_selector='#__BVID__32___BV_tab_button__'
    await page.click(tab_selector)
    try {
        await page.waitForSelector(rounded_button_selector, {timeout: 5000})
    } catch(e) {
        // no data in this tab
    }
    // console.log("validating faces: "+await test_screenshot_containing_video(page, 'screenshot05_tab_faces', {
    //     fullPage: true,
    // }))

    // VALIDATE WORDS TAB
    tab_selector='#__BVID__34___BV_tab_button__'
    await page.click(tab_selector)
    try {
        await page.waitForSelector(rounded_button_selector, {timeout: 3000})
    } catch(e) {
        // no data in this tab
    }
    // console.log("validating words: "+await test_words_screenshot(page, 'screenshot06_tab_words', {
    //     fullPage: true,
    // }))

    // VALIDATE CUES TAB
    tab_selector='#__BVID__36___BV_tab_button__'
    await page.click(tab_selector)
    await page.waitForTimeout(3000)
    // console.log("validating cues: "+await test_screenshot_containing_video(page, 'screenshot07_tab_cues', {
    //     fullPage: true,
    // }))

    // VALIDATE SHOTS TAB
    tab_selector='#__BVID__38___BV_tab_button__'
    await page.click(tab_selector)
    await page.waitForTimeout(3000)
    // console.log("validating shots: "+await test_screenshot_containing_video(page, 'screenshot08_tab_shots', {
    //     fullPage: true,
    // }))

    // VALIDATE TRANSCRIPT TAB
    tab_selector='#__BVID__40___BV_tab_button__'
    await page.click(tab_selector)
    await page.waitForTimeout(3000)
    // console.log("validating transcript: "+await test_screenshot_containing_video(page, 'screenshot09_transcript', {
    //   fullPage: true,
    // }))

    // VALIDATE TRANSLATION TAB
    tab_selector='#__BVID__45___BV_tab_button__'
    await page.click(tab_selector)
    await page.waitForTimeout(3000)
    // console.log("validating translation: "+await test_screenshot_containing_video(page, 'screenshot10_translation', {
    //   fullPage: true,
    // }))

    // VALIDATE TRANSLATE TAB
    tab_selector='#__BVID__47___BV_tab_button__'
    await page.click(tab_selector)
    await page.waitForTimeout(3000)
    // console.log("validating key phrases: "+await test_screenshot_containing_video(page, 'screenshot11_keyphrases', {
    //   fullPage: true,
    // }))

    // VALIDATE TRANSLATE TAB
    tab_selector='#__BVID__49___BV_tab_button__'
    await page.click(tab_selector)
    await page.waitForTimeout(3000)
    // console.log("validating entities: "+await test_screenshot_containing_video(page, 'screenshot12_entities', {
    //   fullPage: true,
    // }))

  // VALIDATE UPLOAD PAGE
    await page.goto(url + "/upload", {waitUntil: 'load'});
    await page.waitForSelector('#app > div > div.container > div.container > div > div > button.btn.m-1.btn-secondary.collapsed', {
        visible: true,
    });
    page.once('load', () => console.log('Upload page loaded'));

    // Does the configure workflow form look right?
    await page.click('#app > div > div.container > div.container > div > div > button.btn.m-1.btn-secondary.collapsed');
    await page.waitForTimeout(500)
    console.log("validating upload page: "+await test_screenshot_containing_video(page, 'screenshot13_configure_workflow_form_default', {
        fullPage: true,
    }))

    await page.click('#collapse-2 > div > div:nth-child(2) > button:nth-child(2)');
    await page.waitForTimeout(500)
    console.log("validating workflow config form: "+await test_screenshot_containing_video(page, 'screenshot14_configure_workflow_form_clear_all', {
        fullPage: true,
    }))

    await page.click('#collapse-2 > div > div:nth-child(2) > button:nth-child(1)');
    await page.waitForTimeout(500)
    console.log("validating clear all: "+await test_screenshot(page, 'screenshot15_configure_workflow_form_select_all', {
        fullPage: true,
    }))

    await browser.close();
    console.log("Done")
})();

