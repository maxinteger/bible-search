var request = require('request'),
    fs = require('fs'),
    $ = require('cheerio');

var ary = [],
    chAry = [],
    dict = {},
    books = ["Mózes első könyve", "Mózes második könyve", "Mózes harmadik könyve", "Mózes negyedik könyve", "Mózes ötödik könyve", "Józsué könyve", "A bírák könyve", "Ruth könyve", "Sámuel első könyve", "Sámuel második könyve", "A királyok első könyve", "A királyok második könyve", "A krónikák első könyve", "A krónikák második könyve", "Ezsdrás könyve", "Nehémiás könyve", "Eszter könyve", "Jób könyve", "A zsoltárok könyve", "A példabeszédek könyve", "A prédikátor könyve", "Énekek éneke", "Ézsaiás próféta könyve", "Jeremiás próféta könyve", "Jeremiás siralmai", "Ezékiel próféta könyve", "Dániel próféta könyve", "Hóseás próféta könyve", "Jóel próféta könyve", "Ámósz próféta könyve", "Abdiás próféta könyve", "Jónás próféta könyve", "Mikeás próféta könyve", "Náhum próféta könyve", "Habakuk próféta könyve", "Zofóniás próféta könyve", "Haggeus próféta könyve", "Zakariás próféta könyve", "Malakiás próféta könyve", "Máté evangéliuma", "Márk evangéliuma", "Lukács evangéliuma", "János evangéliuma", "Az apostolok cselekedetei", "Pál levele a rómaiakhoz", "Pál első levele a korinthusiakhoz", "Pál második levele a korinthusiakhoz", "Pál levele a galatákhoz", "Pál levele az efezusiakhoz", "Pál levele a filippiekhez", "Pál levele a kolosséiakhoz", "Pál első levele a thesszalonikaiakhoz", "Pál második levele a thesszalonikaiakhoz", "Pál első levele timóteushoz", "Pál második levele timóteushoz", "Pál levele tituszhoz", "Pál levele filemonhoz", "A zsidókhoz írt levél", "Jakab levele", "Péter első levele", "Péter második levele", "János első levele", "János második levele", "János harmadik levele", "Júdás levele", "A jelenések könyve"]

function getA(b, ch, v){
    return b + "-" + ch + "-" + (v || 1)
}

function process (data, book, ch){
    var p = $.load(data),
        verses = p('tr');

    if (verses.length > 0){
        // chapter number
        chAry.push('<h3><a name="ch-'+book+'-'+ch+'">' + ch + '</h3>');
        // verses
        verses.each(function (idx, el) {
            var $row = $(el),
                $vers = $row.find('td').eq(1),
                $links = $row.find('a.small'),
                t;
            // header
            if ((t = $vers.find('p')).length){
                chAry.push("<b>" + t.text() + "</b>")
                t.remove()
            }
            // text
            chAry.push(versTemplate({
                name:getA(book, ch, idx + 1),
                idx: idx + 1,
                text: $vers.text()
            }));
            // links
            if ($links.length){
                var links = []
                $links.each(function(){
                    var $this = $(this),
                        param = $this.attr('href').match(/book=(\d+).*chapter=(\d+).*verses=(\d+)?/),
                        link = param ? getA(param[1], param[2], param[3]) : '';
                    links.push('<a href="#' + link + '">' + $this.text() + '</a>')
                })

                chAry.push("<p>" + links.join(', ') + "</p>" )
            }
        })
        getData(book, ch+1);
    } else {
        if (chAry.length){
            chAry.unshift(generateChapterTable(book, ch))
            ary = ary.concat(chAry)
            chAry = []
        }
        if (ch > 1){
            if (book == 39){
                ary.push('<br><br><br><h1><center>Újszövetség</center></h1><br><br>')
            }
            if (books[book] ){
                ary.push('<h2><a name="book-' + book + '">' + books[book] + '</a></h2>')
            }
            getData(book + 1, 1);
        } else {
            finish()
        }
    }
}

function getData(book, ch){
    console.log('>>', book, ch);
    request({
        url: 'http://www.parokia.hu/bible/body.php?book=' + book + '&chapter=' + (([31, 57, 63, 64, 65].indexOf(book) != -1)&& ch == 1 ? 0 : ch),
        encoding: 'binary'
    }, function(err, resp, body) {
        process(body, book, ch);
    });
}

function generateChapterTable (book, chapterNum){
    var html = ['<br><b>Fejezetek:</b> '];
    html.push(_.map(_.range(1, chapterNum), function(i){
        return '<a href="#ch-'+book+'-'+i+'">' + i + '</a>'
    }).join(', '));
    html.push('<br>');
    return html.join('');
}


function generateCover(){
    var html = []
    _.each(books, function(book, idx){
        if (idx == 0){
            html.push('<h3>Ószövetség</h3>')
            html.push('<ol>')
        }
        if (idx == 39){
            html.push('</ol>')
            html.push('<h3>Újszövetség</h3>')
            html.push('<ol>')
        }
        html.push('<li><a href="#book-'+idx+'">' + book + '</a></li>')
    })
    html.push('</ol>')
    html.push('<br><br><br><h1><center>Ószövetség</center></h1><br><br>')
    return html.join(' ');
}

function finish(){
    fs.writeFile("index.html", '<html><head><meta http-equiv="content-type" content="text/html; charset=UTF-8"/></head><body>' +
        "<h3>PROTESTÁNS ÚJ FORDÍTÁSÚ (revideált) BIBLIA</h3>" +
        "<p>Az 1975-ben megjelent teljes Szentírás héber és görög eredetiből fordított szövegének revízióját olvasói észrevételek és hozzászólások figyelembevételével revíziós bizottság készítette el. Nyelvezete az eredetihez való hűség mellett a mai beszélt magyar nyelvet tükrözi. Megjelent a Vizsolyi Biblia 400 éves jubileumára, 1990-ben.<p>" +
        '<p>Forrás: <a href="http://www.parokia.hu/bible/">Parókia.hu</p>'+
        "<br><br><br><br><br>" +
        generateCover() +
        ary.join(' ') +
        "<body></html>")
}

getData(0,10)
