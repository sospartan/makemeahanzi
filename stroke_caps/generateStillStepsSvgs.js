#!/usr/bin/env node

const TEST_MODE=false // set true to only generate 3 svgs and save them in ./
if (TEST_MODE) { var a = 0 }

const fs = require('fs-extra')
const readline = require('readline')
const cheerio = require('cheerio')

let stepCss = '';
for(let i=1;i<30;i++){
    stepCss += `\n.step${i} {transform: translateX(${i*1024}px);}`
}
const newCss = `
    <style type="text/css">
        .origin {display:none;}
        .hide {display:none;}
        .stroke {fill: #000000;}
        ${stepCss}
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
        let origin = $('g:nth-of-type(2)');

        for(let i=0;i<pathEls.length;i++){
            var step = origin.clone();
            let stepPathEls = $('path[fill="lightgray"]',step)
            
            stepPathEls.each((ei,elem)=>{
                if(ei>i){
                    $(elem).addClass('hide')
                }else{
                    $(elem).addClass(`stroke step${i}`)
                
                }
            })
            let pathes = $.html(stepPathEls).replace(/<path/g,'\n    <path')
            step.html(`${newCss}${pathes}`)
            origin.parent().append(step)
        }
        
        origin.addClass(`origin`)
        
        let pathes = $.html(pathEls).replace(/<path/g,'\n    <path')
        $('g:nth-of-type(2)').html(`${newCss}${pathes}`)
        $('g:nth-of-type(1)').remove()

        $('svg').attr('viewBox',`0 0 ${1024*pathEls.length} 1024`)
        const newSvgStr = $.html($('svg'))


        if (!TEST_MODE) {
            fs.writeFile(`../svgs-still-step/${charCode}-still.svg`, newSvgStr).then(() => {
                console.log(`../svgs-still-step/${charCode}-still.svg written`)
            })
        } else {
            fs.writeFile(`./${charCode}-still.svg`, newSvgStr).then(() => {
                console.log(`./${charCode}-still.svg written`)
            })
        }
    }).catch(console.error)
})
