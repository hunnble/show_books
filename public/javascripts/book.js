/**
 * 调用豆瓣搜索书API并解析获取的json数据，动态渲染页面。
 */
function getSearch () {
  var name = window.location.pathname.split('/')[2];

  if (name) {
    $.ajax({
      type: 'GET',
      url: 'https://api.douban.com/v2/book/search?q=' + name,
      dataType: 'jsonp',
      jsonp: 'callback',
      success: function (bookJSON) {
        renderBook(bookJSON);
      }
    });
  }
}

/**
 * 渲染页面
 * @param bookJSON
 */
function renderBook (bookJSON) {
  var counter = 0;
  var perBookDelay = 200;
  var $wrappers = $('#books>div');
  var wrappersNum = Math.min($wrappers.length, bookJSON.books.length);

  if (bookJSON.books.length < $wrappers.length) {
    var $wrapper = $('#books>div:eq(0)');
    $wrapper.css('width', '100%');
    $wrappers = [$wrapper];
  }

  $.each(bookJSON.books, function (index, book) {
    // var $wrappers = $('#books>div'),
    //   wrappersNum = 3,
    var $section = $('<section></section>'),
      $header = $('<header></header>'),
      $title = $('<p class="bookTitle">' + book.title + '</a>'),
      $author = $('<span class="bookAuthor">作者: ' + (book.author[0] || '无') + '</span>');
      $image = $('<img src="' + book.image + '" />'),
      $p = $('<p>' + book.summary.replace(/\n/g, '<br />') + '</p>'),
      $tags = $('<div class="bookTags"></div>'),
      $doubanBtn = $('<a class="bookBtn" href="' + book.alt + '" target="_blank><button type="button" class="doubanBtn">豆瓣</button></a>'),
      $addBtn = $('<a href="#" class="addBtn">收藏</a>');

    $.each(book.tags, function (index, tag) {
      $tags.append('<span class="bookTag">' + tag.name + '</span>');
    });

    $addBtn.click(function () {
      $.post('/book', {
        bookId: book.id,
        isbn10: book.isbn10 || '',
        isbn13: book.isbn13 || '',
        name: book.title,
        author: book.author[0] || '',
        img: book.image || '',
        summary: book.summary || ''
      }, function (result) {
        if (result.success) {
          window.location.replace('/archive');
        } else {
          // 提示错误
        }
      });
    });

    $header.append($image, $title, $author, $doubanBtn, $addBtn);
    $section.append($header, $tags, $p);

    var $targetWrapper = $($wrappers[0]);
    var targetWrapperHeight = parseInt($targetWrapper.css('height'), 10);
    for (var i = 1; i < wrappersNum; ++i) {
      var tempHeight = parseInt($($wrappers[i]).css('height'), 10);
      if (tempHeight < targetWrapperHeight) {
        $targetWrapper = $($wrappers[i]);
        targetWrapperHeight = tempHeight;
      }
    }

    $targetWrapper.append($section).hide().delay(counter).fadeIn(500);
    counter += perBookDelay;
  });
}

$(document).ready(function () {
  getSearch();
});
