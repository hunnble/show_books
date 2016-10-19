$(document).ready(function () {

	/**
	 * sidebar
	 */
	
	$('.sideBarSwitcher').click(function () {
		var $sidebar = $('.sidebar');
		var $main = $('.main');
		var curRight = $sidebar.css('right');

		$sidebar.stop(true, true);
		if (curRight === 0 || curRight === '0px') {
			$sidebar.animate({
				'right': '-' + $sidebar.css('width')
			}, 300);
			$main.animate({
				'width': '100%'
			}, 300);
		} else {
			$sidebar.animate({
				'right': 0
			}, 300);
			$main.animate({
				'width': parseInt($main.css('width'), 10) - parseInt($sidebar.css('width'), 10) + 'px'
			}, 300);
		}
	});

	/**
	 * archive
	 */
	
	$('.removeBook').click(function () {
        var $removeItem = $(this).parent();

        if (confirm('确认删除这本书')) {
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

        if (confirm('确认删除这条笔记?')) {
            var $bookBlock = $removeItem.parent().parent();

            $.post('/archive', {
                'isComment': true,
                'name': $bookBlock.find('.name').html(),
                'author': $bookBlock.find('.author').html(),
                'commentId': $removeItem.find('.commentId').val()
            });
            $removeItem.remove();
        }
    });

    $('.showCommentBtn').click(function () {
        var $comment = $(this).parent().find('.comment');

        $('.curComment').hide(500).removeClass('curComment');

        $comment.addClass('curComment').show(500);
    });

    /**
     * add_comment
     */

    $('textarea[name=comment]').bind('paste cut keydown keyup focus blur', function () {
        $('.wordNumber').html($(this).val().replace(/\n|\r|\r\n/g, '').length);

        $.post(window.location.href, {
            'isAjax': true,
            'comment': $(this).val().replace(/\n|\r|\r\n/g, '\n\n')
        }, function (resTxt) {
            $('.preview').html(resTxt);
        });
    });

});