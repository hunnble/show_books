$(document).ready(function () {
    $('.removeBtn').click(function () {
        var $book = $(this).parent();

        if (confirm('确认删除?')) {
            $.post('/archive', {
                'name': $book.find('.name').html(),
                'author': $book.find('.author').html()
            });
            $book.remove();
        }
    });
});