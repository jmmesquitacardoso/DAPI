var bot = require('nodemw');
var fs = require('fs');
var async = require('async');
var path = require('path');
var writeDir = './featured_articles';

  // pass configuration object
  var client = new bot({
    server: 'pt.wikipedia.org',  // host name of MediaWiki-powered site
    path: '/w',                  // path to api.php script
    debug: false                 // is more verbose when set to true
  });

  client.getPagesInCategory('!Artigos destacados', function(err, data){
      if(!err){
        console.log("data length = " + data.length);
        async.eachSeries(data, function(item, callback) {
            var currentDir = path.join(__dirname, writeDir, item.title);
            getArticles(currentDir, item.title, function(err, revisions){
              if(!err) {
                async.eachSeries(revisions, function(item, callback2) {
                  openFile(currentDir, item, function(err, fd) {
                    if(!err){
                      writeToFile(fd, item, callback2);
                    }else{
                      console.log(err);
                    }
                  });
                }, callback);
              } else {
              console.log(err);
              }
            });
          });
      }
    });

  function getArticles(dir, title, callback){
    fs.mkdir(dir, function(err){
      if(!err){
        client.getArticleRevisions(title, callback);
      }else{
        console.log(err);
      }
    });
  };

  function openFile(dir, data, callback){
    console.log("Opening file in dir = " + dir);
    var timestamp = (data.timestamp).replace(/:/g,"_");
    var totalPath = path.join(dir, timestamp);
    var user = (data.user).replace(/:/g,"_").replace(/"/g,"~").replace(/\*/g, "^");
    //(data.user).replace(/"/g,".");
    totalPath += "+" + user;
    fs.open(path.normalize(totalPath), 'w+', callback);
  };

  function writeToFile (fd, data, callback) {
    fs.writeSync(fd, data['user']);
    fs.writeSync(fd, '\n');
    fs.writeSync(fd, data['*']);
    fs.closeSync(fd);
    callback();
  }
