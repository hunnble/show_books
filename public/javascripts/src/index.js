define(['jquery'], function ($) {
	start($);
});

function start ($) {

	/**
	 * all
	 */
	// var $dialog = $('#dialog');
	// hideDialog();

	// $('form').submit(showDialog);
	// $('a').click(showDialog);

	// function showDialog () {
	// 	$dialog.removeClass('hide');
	// }
	//
	// function hideDialog () {
	// 	$dialog.addClass('hide');
	// }

	$('.flashWrapper').delay(3000).fadeOut(500);

	$('.navSwitcher').click(function () {
		var $navSwitcher = $('.navSwitcher');
		var $nav = $('.nav');
		var curTop = $nav.css('top');

		$nav.stop(true, true);
		if (curTop === 0 || curTop === '0px') {
			$nav.animate({
				'top': '-' + $nav.css('height')
			}, 300);
			$navSwitcher.find('span').css('backgroundColor', '#444444');
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
			// showDialog();
			$.post('/book', {
				'_method': 'delete',
				'username': window.location.href.split('/').reverse()[0],
				'bookId': $(this).parent().find('.bookId').val(),
        'name': $removeItem.find('.name').html(),
        'author': $removeItem.find('.author').html(),
				'commentId': null
			}, function (data) {
				if (data.success) {
					$removeItem.remove();
					// hideDialog();
				}
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
			showDialog();
			$.post('/comment', {
				'_method': 'delete',
        'name': decodeURI(window.location.href.split('/').reverse()[0]),
        'commentId': $removeItem.find('.commentId').val()
      }, function (data) {
				if (data.success) {
					$removeItem.remove();
					hideDialog();
				}
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
		$('.changeUserPswordForm').addClass('hide');
	});

	$('.changeUserPswordBtn').click(function () {
		$('.changeUserPswordForm').toggleClass('hide');
		$('.changeUserInfoForm').addClass('hide');
	});

	var $userHeadFile = $('.userHeadFile');

	$('.userHeadFileBtn').click(function () {
		if ($userHeadFile) {
			$userHeadFile.click();
		}
	});

	$userHeadFile && $userHeadFile.on('change', function (e) {
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
			$('.userHeadImg').attr('src', result);
		};
	});

}
