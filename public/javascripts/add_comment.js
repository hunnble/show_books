$(document).ready(function () {
    $('textarea').bind('paste cut keydown keyup focus blur', function () {
        $('.wordNumber').html($(this).val().replace(/\n|\r|\r\n/g, '').length);

        $.post(window.location.href, {
            'isAjax': true,
            'comment': $(this).val().replace(/\n|\r|\r\n/g, '\n\n')
        }, function (resTxt) {
            $('.preview').html(resTxt);
        });
    });
});