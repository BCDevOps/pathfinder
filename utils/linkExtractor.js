const got = require('got')
const cheerio = require('cheerio')
const YAML = require('yamljs')

async function extract(url) {
    let currentEntries = []

    got(url).then(response => {
        // console.log('========' + url + '========')

        let body = response.body
        const $ = cheerio.load(body)

        $('.well h2').each(function(index) {
        let sectionTitle = $(this).text().trim()
        // console.log("=======" + sectionTitle + "=========")

        $(this).siblings().find('ul li > a').each(function(index) {
            let link = $(this).attr('href')
            let linkText = $(this).text()

            // console.log(link + " " + linkText)

            let linkEntry = {
                "originalSource": url,
                "category": sectionTitle,
                "link": link,
                "description": linkText
            }

            currentEntries.push(linkEntry)
        })
    })
    console.log(currentEntries)

    return currentEntries

}).catch(error => {
        console.log(error.response.body)
})
}


let linkBlob = {}
let entries = []
linkBlob.entries = entries

entries.concat(extract('https://www.pathfinder.gov.bc.ca/'))
entries.concat(extract('https://www.pathfinder.gov.bc.ca/_pages/openshift_resources.html'))
entries.concat(extract('https://github.com/BCDevOps/pathfinder/blob/master/_pages/bcgov_org_github.html'))
entries.concat(extract('https://github.com/BCDevOps/pathfinder/blob/master/_pages/critical_systems_faq.html'))

console.log(YAML.stringify(linkBlob))