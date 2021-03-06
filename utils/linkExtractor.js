const cheerio = require('cheerio');
const YAML = require('yamljs');
const fs = require('nano-fs');
const fetch = require('node-fetch');
const filter = require('awaity/filter');
const { map, reduce, sum } = require('awaity/esm');

async function extract(path) {
    let currentEntries = [];

    try {

        let pageContent = await fs.readFile(path, 'utf8');

        const $ = cheerio.load(pageContent);

        // each .well is a logical section
        $('.well h2').each(function (index) {
            let sectionTitle = $(this).text().trim();

            $(this).siblings().find('ul li > a').each(function (index) {
                let link = $(this).attr('href');
                let linkText = $(this).text();

                let linkEntry = {
                    "originalSource": path,
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
/**
 * filters items by checking if links work or not
 */
const filterItemsByLinks = async (items) => {
    try {
        const itemsFiltered = await map(items, async (item) => {
            try {
                // is item a absolute path via http
                if(/^https?/.test(item.link)) {
                    // fetch resource for its status code
                    const res = await fetch(item.link);
                    // if resource not found return undefined
                    return res.status == 200 ? item : undefined;
                } else {
                    return item;
                }
            } catch(e) {
                // if unable to fetch return undefined
                return undefined;
            }
        });
        return itemsFiltered.filter(item => (item !== undefined));
    } catch(e) {
        console.error("Gah! (" + e + ")");
    }
}

const main = async () => {

    //collect links from each of the pages in turn
    let items = await extract('../index.html');
    items = items.concat(await extract('../_pages/openshift_resources.html'));
    items = items.concat(await extract('../_pages/bcgov_org_github.html'));
    // ensure item links work by filtering them
    items = await filterItemsByLinks(items);
    //provide a wrapper object for them
    let linkBlob = {
        entries: items
    };

    //export to YAML and write to stdout
    console.log(YAML.stringify(linkBlob));
};

main();
