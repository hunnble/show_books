$(document).ready(function () {

	/**
	 * all
	 */
	// $('.ratyli').ratyli();

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

    if (confirm('确认删除?')) {
			$.post('/book', {
				'_method': 'delete',
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
	$('.commentContent').each(function () {
		$(this).html(markdown.toHTML($(this).html().replace(/\n|\r|\r\n/g, '\n\n')));
	});

  $('.removeComment').click(function () {
    var $removeItem = $(this).parent();

    if (confirm('确认删除?')) {
			$.post('/comment', {
				'_method': 'delete',
        'name': decodeURI(window.location.href.split('/').reverse()[0]),
        'commentId': $removeItem.find('.commentId').val()
      }, function (data) {
				data.success && $removeItem.remove();
			});

    }
  });

	$('.createCommentBtn').click(function () {
		var href = window.location.href;

		window.location.href = href.replace('comment', 'editcomment');
	});

  /**
   * editcomment
   */
  $('textarea[name=comment]').bind('paste cut keydown keyup focus blur', function () {
    $('.wordNumber').html($(this).val().replace(/\n|\r|\r\n/g, '').length);
		$('.preview').html(markdown.toHTML($(this).val().replace(/\n|\r|\r\n/g, '\n\n')));
  });

	/**
	 * profile
	 */
	$('.changeUserInfoBtn').click(function () {
		$('.changeUserInfoForm').toggleClass('hide');
	});

	$('.user-head-img').click(function () {
		$('.user-head-file').click();
	});

	$('.user-head-file').on('change', function (e) {
		var reader = new FileReader();
		var file = e.target.files[0];

		if (!(file.type.indexOf('image') === 0 && file.type && /\.(?:jpg|png|gif)$/.test(file.name))) {
			return false;
		}
		reader.readAsDataURL(file);

		reader.onload = function (e) {
			var result = e.target.result;

			$.post('/profile', {
				head: result
			});
			$('.user-head-img').attr('src', result);
		};
	});

});
