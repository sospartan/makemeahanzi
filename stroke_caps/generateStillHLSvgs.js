#!/usr/bin/env node

const TEST_MODE=false // set true to only generate 3 svgs and save them in ./
if (TEST_MODE) { var a = 0 }

const fs = require('fs-extra')
const readline = require('readline')
const cheerio = require('cheerio')


const newCss = `
    <style type="text/css">
        .origin {display:none;}
        .hide {display:none;}
        .stroke {fill: lightgray;}
    </style>
`

const lineReader = readline.createInterface({
    input: fs.createReadStream(`${__dirname}/../graphics.txt`)
})

lineReader.on('line', line => {
    if (TEST_MODE) { if (a<3) {a++} else {return} }
    const item = JSON.parse(line)
    const charCode = item.character.charCodeAt()
    const startingPoints = item.medians.map(i=>({x:i[0][0],y:i[0][1]}))
    fs.readFile(`${__dirname}/../svgs/${charCode}.svg`, 'utf8').then(svgStr => {
        const $ = cheerio.load(svgStr)
        
        let pathEls = $('g:nth-of-type(2) > path[fill="lightgray"]')
        pathEls.each((ei,elem)=>{
            
                $(elem).addClass(`stroke`)
            
            
        })
        let pathes = $.html(pathEls).replace(/<path/g,'\n    <path')
        $('g:nth-of-type(2)').html(`${newCss}${pathes}`)
        $('g:nth-of-type(1)').remove()//no dash line

        const newSvgStr = $.html($('svg'))


        if (!TEST_MODE) {
            fs.writeFile(`../svgs-still-gy/${charCode}-still.svg`, newSvgStr).then(() => {
                console.log(`../svgs-still-gy/${charCode}-still.svg written`)
            })
        } else {
            fs.writeFile(`./${charCode}-still.svg`, newSvgStr).then(() => {
                console.log(`./${charCode}-still.svg written`)
            })
        }
    }).catch(console.error)
})
