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
  $.each(bookJSON.books, function (index, book) {
    var $wrappers = $('#books>div'),
      wrappersNum = 3,
      $section = $('<section></section>'),
      $header = $('<header></header>'),
      $title = $('<a class="bookTitle" href="' + book.alt + '" target="_blank">' + book.title + '</a>'),
      $author = $('<span class="bookAuthor">作者: ' + (book.author[0] || '无') + '</span>');
      $image = $('<img src="' + book.image + '" />'),
      $p = $('<p>' + book.summary + '</p>'),
      $tags = $('<div class="bookTags"></div>'),
      $doubanBtn = $('<button type="button" class="bookBtn doubanBtn">前往豆瓣</button>'),
      $addBtn = $('<button type="button" class="bookBtn addBtn">收藏本书</button>');

    $.each(book.tags, function (index, tag) {
      $tags.append('<span class="bookTag">' + tag.name + '</span>');
    });

    $addBtn.click(function () {
      $.post('/book', {
        bookId: book.id,
        isbn10: book.isbn10,
        isbn13: book.isbn13,
        name: book.title,
        author: book.author[0] || '',
        img: book.image || ''
      }, function (result) {
        if (result.success) {
          window.location.replace('/archive');
        } else {
          // 提示错误
        }
      });
    });

    $header.append($title, $author, $image, $addBtn);
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

    $targetWrapper.append($section);


  });
}

$(document).ready(function () {
  getSearch();
});
