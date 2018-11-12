var _ = require("lodash");
var Error = require("./Error");

/**
 * Handle Error
 * @param  {Object} req    request
 * @param  {Object} res    response
 * @param  {Object} error  error object
 * @param  {Number} status http status
 * @return {undefined}
 */

class Utils {

    static handleError(req, res, error, status){

        var status = status || error.status || 500;
    
        console.error('#handleError()'.red, status, error);
    
        if(error instanceof Error){
            return res.status(status).send(error.toJSON());
        }else{
            if(error != undefined){
                error.message = error.toString();
                return res.status(status).send(error);
            }else{
                return res.status(500).send(error);
            }
        }
    }

    static replaceURLs(str){

        const cheerio = require('cheerio');
        const $ = cheerio.load(str);

        var divs = $(".wc-hybrid-url");

        if(divs.length == 0)
            return str;

        if(divs.length > 0){
            divs.remove();
        }

        return $.text();
        
        /*
        var matches = this.extractURLs(str);
    
        console.log(matches);

        for(var i in matches){
            str = str.replace(matches[i].match, matches[i].label);
        }

        console.log("replaced:", str);

        return str;
        */
    
    }

    static extractURLs(str){
        
        const cheerio = require('cheerio');
        const $ = cheerio.load(str);

        var urls = [];
        var as = $("a");

        for(var i=0; i<as.length; i++){
            urls.push({
                url : $($("a")[i]).attr("href"),
                label : $($("a")[i]).attr("data-wc-label"),
                title : $($("a")[i]).attr("data-wc-title"),
            })
        }

        return urls;


        /*

        var rg = new RegExp('<a href=(?:"|\')([^"|\']*)(?:"|\')[^>]*>([\\sa-zA-ZáéíóúÁÉÍÓÚ]*)<\/a>', "gi");
        var urls = [];
        var matches;
    
        while ((matches = rg.exec(str)) !== null) {
    
            console.log(matches);
    
            var url_match = matches;
    
            urls.push({
                url : url_match[1],
                label : url_match[2].trim(),
                match : url_match[0],
                index : url_match[3]
            });
        }
    
        return urls;*/
        
    }

    static capitalizeFirstLetter(string){
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

}

module.exports = Utils;