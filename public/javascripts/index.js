$(document).ready(function () {

	/**
	 * sidebar
	 */

	$('.sideBarSwitcher').click(function () {
		var $sideBarSwitcher = $('.sideBarSwitcher');
		var $sidebar = $('.sidebar');
		var curTop = $sidebar.css('top');

		$sidebar.stop(true, true);
		if (curTop === 0 || curTop === '0px') {
			$sidebar.animate({
				'top': '-' + $sidebar.css('height')
			}, 300);
			$sideBarSwitcher.find('span').css('backgroundColor', '#7B6093');
		} else {
			$sidebar.animate({
				'top': 0
			}, 300);
			$sideBarSwitcher.find('span').css('backgroundColor', '#ffffff');
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
