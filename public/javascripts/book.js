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
    var $section = $('<section></section>'),
      $header = $('<header></header>'),
      $title = $('<a class="bookTitle" href="' + book.alt + '">' + book.title + '</a>'),
      $author = $('<span class="bookAuthor">作者: ' + (book.author[0] || '无') + '</span>');
      $image = $('<img src="' + book.image + '" />'),
      $p = $('<p>' + book.summary + '</p>'),
      $tags = '',
      $addBtn = $('<button type="button" class="addBtn">收藏本书</button>');

    $.each(book.tags, function (index, tag) {
      $tags += '<span class="book_tag">' + tag.name + '</span>';
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

    $header.append($title, $author, $image);
    $section.append($header, $addBtn, $tags, $p);

    $('#books').append($section);


  });
}

$(document).ready(function () {
  getSearch();
});
