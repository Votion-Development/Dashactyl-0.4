const settings = require("../settings.json");
const fetch = require('node-fetch');
const indexjs = require("../index.js");
const fs = require("fs");
module.exports.load = async function(app, db) {
 
    app.get("/lv", async (req, res) => {
        if (!req.session.pterodactyl) return res.redirect("/login")
        let newsettings = JSON.parse(require("fs").readFileSync("./settings.json"));
        //btoa and linkvertise function is yoinked from https://github.com/FutureStunt/linkvertise/blob/master/linkvertise.js              
        function btoa(str) {
        var buffer;
        if (str instanceof Buffer) {
        buffer = str;
        } else {
        buffer = Buffer.from(str.toString(), "binary");
        }
        return buffer.toString("base64");
           }
  
        function linkvertise(userid, link) {
        var base_url = `https://link-to.net/${userid}/${Math.random() * 1000}/dynamic`; //this makes the linkvertise link
        var href = base_url + "?r=" + btoa(encodeURI(link));
        return href;
          }
        if (newsettings.api.lv.enabled == true) {
            let theme = indexjs.get(req);
            let code = req.query.code ? req.query.code.slice(0, 200) : Math.random().toString(36).substring(2, 15);
            if (!code.match(/^[a-z0-9]+$/i)) return res.redirect(theme.settings.redirect.missingorinvalidlvcode + "?err=CREATECOUPONINVALIDCHARACTERS");
            let newsettings = JSON.parse(require("fs").readFileSync("./settings.json"));
            let coins = newsettings.api.lv.coins //yoinked from admin.js thank me later
             let ram = 0;
            let disk = 0;
            let cpu = 0;
            let servers = 0;
            coins = parseFloat(coins);
            ram = parseFloat(ram);
            disk = parseFloat(disk);
            cpu = parseFloat(cpu);
            servers = parseFloat(servers);
            await db.set("coupon-" + code, {
                coins: coins,
                ram: ram,
                disk: disk,
                cpu: cpu,
                servers: servers
            });
            
            let redeemcouponlink = `${req.headers.host}/${theme.settings.redirect.redeemcoupon}?code=${code}`
            let codelink = `${redeemcouponlink}?code=${code}`
            let linkuserid = newsettings.api.lv.userid
            let linkredirect = linkvertise(linkuserid,codelink)
            res.redirect(linkredirect)
        }
        else {
            let theme = indexjs.get(req);
            ejs.renderFile(
              `./themes/${theme.name}/${theme.settings.notfound}`, 
              await eval(indexjs.renderdataeval),
              null,
            async function (err, str) {
              delete req.session.newaccount;
              if (err) {
                console.log(`[${chalk.blue("WEBSITE")}] An error has occured on path ${req._parsedUrl.pathname}:`);
                console.log(err);
                return res.send("An error has occured while attempting to load this page. Please contact an administrator to fix this.");
              };
              return res.send(str);
            });
          }
        }
    )

}


