$(document).ready(function () {
    $('.removeBook').click(function () {
        var $removeItem = $(this).parent();

        if (confirm('确认删除这本书的所有信息?')) {
            $.post('/archive', {
                'isComment': false,
                'name': $removeItem.find('.name').html(),
                'author': $removeItem.find('.author').html()
            });
            $removeItem.remove();
        }
    });
    $('.removeComment').click(function () {
        var $removeItem = $(this).parent();

        if (confirm('确认删除这条书评?')) {
            var $bookBlock = $removeItem.parent().parent();
            console.log($removeItem.find('.commentId').val());
            $.post('/archive', {
                'isComment': true,
                'name': $bookBlock.find('.name').html(),
                'author': $bookBlock.find('.author').html(),
                'commentId': $removeItem.find('.commentId').val()
            });
            $removeItem.remove();
        }
    });
});