const got = require('got');
const cheerio = require('cheerio');
const YAML = require('yamljs');

async function extract(url) {
    let currentEntries = [];

    try {
        let response = await got(url);

        let body = response.body;
        const $ = cheerio.load(body);

        // each .well is a logical section
        $('.well h2').each(function (index) {
            let sectionTitle = $(this).text().trim();

            $(this).siblings().find('ul li > a').each(function (index) {
                let link = $(this).attr('href');
                let linkText = $(this).text();

                let linkEntry = {
                    "originalSource": url,
                    "category": sectionTitle,
                    "link": link,
                    "description": linkText
                };

                currentEntries.push(linkEntry)
            });
        });

        return currentEntries;

    } catch(err) {
        console.log("Gah! (" + err + ")");
        throw err;
    }

}

const main = async () => {

    //collect links from each of the pages in turn
    let items = await extract('https://www.pathfinder.gov.bc.ca/');
    items = items.concat(await extract('https://www.pathfinder.gov.bc.ca/_pages/openshift_resources.html'));
    items = items.concat(await extract('https://www.pathfinder.gov.bc.ca/_pages/bcgov_org_github.html'));

    //provide a wrapper object for them
    let linkBlob = {
        entries : items
    };

    //export to YAML and write to stdout
    console.log(YAML.stringify(linkBlob));
};

main();
