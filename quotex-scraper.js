/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteer = require('puppeteer');

async function getLivePrice() {
    console.log("ব্রাউজার ওপেন হচ্ছে...");
    
    // headless: false দিলে আপনি নিজের চোখে ব্রাউজারটি ওপেন হতে এবং কাজ করতে দেখবেন। 
    // প্রোডাকশনে যাওয়ার পর এটি true করে দেবেন।
    const browser = await puppeteer.launch({ headless: false }); 
    const page = await browser.newPage();

    // Quotex এর ট্রেডিং পেজে যাওয়া (লিংকটি আপনার প্রয়োজন অনুযায়ী পরিবর্তন হতে পারে)
    await page.goto('https://qxbroker.com/en/trade', { waitUntil: 'networkidle2' });

    console.log("পেজ লোড হয়েছে। যদি লগইন চায়, তবে ম্যানুয়ালি লগইন করুন...");

    // ⚠️ এখানে 'PRICE_CSS_CLASS' এর জায়গায় Quotex এর আসল প্রাইস ক্লাসের নাম দিতে হবে
    const priceSelector = '.PRICE_CSS_CLASS'; 

    try {
        // প্রাইস এলিমেন্টটি লোড হওয়া পর্যন্ত অপেক্ষা করবে
        await page.waitForSelector(priceSelector, { timeout: 60000 });
        console.log("প্রাইস এলিমেন্ট পাওয়া গেছে! ডেটা রিড করা শুরু হচ্ছে...");

        // প্রতি ১ সেকেন্ড পরপর লাইভ প্রাইস চেক করবে
        setInterval(async () => {
            try {
                const price = await page.$eval(priceSelector, el => el.innerText);
                console.log('Live Price:', price);
                
                // এখানে আপনি আপনার ডাটাবেজ বা ওয়েব সকেটের মাধ্যমে ফ্রন্টএন্ডে ডেটা পাঠাতে পারেন
            } catch {
                console.log("প্রাইস রিড করতে সমস্যা হচ্ছে...");
            }
        }, 1000);

    } catch {
        console.log("এলিমেন্ট খুঁজে পাওয়া যায়নি। ক্লাস নেম ঠিক আছে কিনা চেক করুন।");
    }
}

getLivePrice();