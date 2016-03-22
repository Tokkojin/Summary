// var TEXTTEASER_URL = 'http://extension.textteaser.com/'
var DIFFBOT_TOKEN       = "0cc09dde3cb2f3756064e8d8d3144cf2";
var DIFFBOT_ANALYZE_API = "http://www.diffbot.com/api/analyze?stats&token=%token%&url=";
var TEXTTEASER_URL = 'http://textteaser.com/'
var summary = ''
var defaultCount = 4
var paragBreak = 3
var view = 1
var max = 1
var count = 6

chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function(tabs) {
  showTitle(tabs[0].url);
  showAuthor(tabs[0].url);
  showAuthorInfo(tabs[0].url);
  summarize(tabs[0].url);
  showLinks(tabs[0].url);
});

function summarize(url) {
  console.log('Summarizing this url: ' + url)

  $.get(TEXTTEASER_URL + "summary", {url: url, output: "json"}, "json")
    .done(function(data) {
      summary = data
      showSentences(defaultCount)
    })
    .fail(function(data) {
      if (data.responseJSON == null) {
        $('#init').empty();
        $('#init').append('Something wrong happened. Please try again later.');
      }
      else {
        console.log(data.responseJSON.error);
        $('#init').empty();
        $('#init').append(data.responseJSON.error);
      }     
    });

}

function showSentences(count) {
  console.log('Adding ' + count + ' sentences in the popup...')

  $('#content').empty();

  sentences =  summary.sentences
  sentences.sort(sortScore).reverse();
  sentences = sentences.slice(0, count)
  sentences.sort(sortOrder)

  var textContent = $('<div></div>').attr({
    id: 'textContent'
  });

    var p = $('<p></p>').attr({
      id: 'paragraph'
    });

    $.each(sentences, function(i, sentence) {
      if(i != 0 && i % paragBreak == 0)
        p.append('<br><br>')
      
      p.append(sentence.sentence + ' ')
    });

    textContent.append(p);

  $('#content').append(textContent);
}

function callDiffBotAPI(url, fields) {
    var targetUrl = url;
    var token = DIFFBOT_TOKEN;

    $.ajax({
        url: "http://api.diffbot.com/v2/article",
        data: {
            token: token,
            url: targetUrl,
            fields : fields
        },
        success: function (data) {
          if(fields === "title"){
            var title = $('<center></center>').attr({
              id: 'title'
              });
            title.append(data.title)
            $("#title").append(title);            
          }

          if(fields === "author"){
            var author = $('<center></center>').attr({
              id: 'author'
              });
            author.append(data.author)
            $("#author").append(author);          
          }

          if(fields === "authorUrl" & data.authorUrl !== undefined){
            var info = $("<a target='_blank'></a>").attr('href', data.authorUrl);
            console.log('author info', data.authorURL)
            info.append('author info')
            $("#authorInfo").append(info);
          }

          if(fields === "links"){
            console.log(data.links);
            var links = '';
            links.append(data.links);
            $("#links").append(links);
          }
        },
        error: function (data) {
          console.log(data);
        }
    })
}

function showTitle(url) {
  console.log('Displaying title...');
  callDiffBotAPI(url, "title");
}

function showAuthor(url) {
  console.log('Displaying author...');
  callDiffBotAPI(url, "author");
}

function showAuthorInfo(url) {
  console.log('Displaying author info...');
  callDiffBotAPI(url, "authorUrl");
}

function showLinks(url) {
  console.log('Displaying links...');
  callDiffBotAPI(url, "links");
}

function sortScore(a, b) {
  if(a.score < b.score)
    return -1;

  if(a.score > b.score)
    return 1

  return 0;
}

function sortOrder(a, b) {
  if(a.order < b.order)
    return -1;

  if(a.order > b.order)
    return 1

  return 0;
}

