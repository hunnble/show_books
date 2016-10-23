$(document).ready(function () {

	/**
	 * nav
	 */
	$('.navSwitcher').click(function () {
		var $navSwitcher = $('.navSwitcher');
		var $nav = $('.nav');
		var curTop = $nav.css('top');

		$nav.stop(true, true);
		if (curTop === 0 || curTop === '0px') {
			$nav.animate({
				'top': '-' + $nav.css('height')
			}, 300);
			$navSwitcher.find('span').css('backgroundColor', '#6699CC');
		} else {
			$nav.animate({
				'top': 0
			}, 300);
			$navSwitcher.find('span').css('backgroundColor', '#FFFFFF');
		}
	});

	/**
	 * archive
	 */
	$('.removeBook').click(function () {
    var $removeItem = $(this).parent().parent();

    if (confirm('确认删除这本书')) {
			$.post('/book', {
				'_method': 'delete',
				'isComment': false,
				'username': window.location.href.split('/').reverse()[0],
				'bookId': $(this).parent().find('.bookId').val(),
        'name': $removeItem.find('.name').html(),
        'author': $removeItem.find('.author').html(),
								'commentId': null
			}, function (data) {
				data.success && $removeItem.remove();
			});
    }
  });

	/**
	 * comment
	 */
  $('.removeComment').click(function () {
    var $removeItem = $(this).parent();

    if (confirm('确认删除这条笔记?')) {
      var $bookBlock = $removeItem.parent().parent();

			$.post('/comment', {
				'_method': 'delete',
        'isComment': true,
				'username': window.location.href.split('/').reverse()[0],
        'name': $bookBlock.find('.name').html(),
        'author': $bookBlock.find('.author').html(),
        'commentId': $removeItem.find('.commentId').val()
      }, function (data) {
				data.success && $removeItem.remove();
			});

    }
  });

	// $('.book')
	// 	.mouseenter(function () {
	// 		$(this).find('.bookBtns').stop(true, true).fadeIn(300);
	// 	})
	// 	.mouseleave(function () {
	// 		$(this).find('.bookBtns').stop(true, true).fadeOut(300);
	// 	});

  /**
   * editcomment
   */
  $('textarea[name=comment]').bind('paste cut keydown keyup focus blur', function () {
    $('.wordNumber').html($(this).val().replace(/\n|\r|\r\n/g, '').length);
		$('.preview').html(markdown.toHTML($(this).val().replace(/\n|\r|\r\n/g, '\n\n')));

    // $.post(window.location.href, {
    //   'isAjax': true,
    //   'comment': $(this).val().replace(/\n|\r|\r\n/g, '\n\n')
    // }, function (resTxt) {
    //   $('.preview').html(resTxt);
    // });
  });

});
