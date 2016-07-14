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
            $title = $('<a href="' + book.alt + '">' + book.title + '</a>'),
            $image = $('<img src="' + book.image + '" />'),
            $p = $('<p>' + book.summary + '</p>'),
            $tags = '';

        $.each(book.tags, function (index, tag) {
            $tags += '<span class="book_tag">' + tag.name + '</span>';
        });

        $header.append($title, $image, $tags);
        $section.append($header, $p);

        $('#books').append($section);
    });
}

$(document).ready(function () {
    getSearch();
});