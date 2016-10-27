var express = require('express');
var async = require('async');
var rqst = require('superagent');
var crypto = require('crypto');
var markdown = require('markdown').markdown;
var Book = require('../models/book.js');
var User = require('../models/user.js');
var Log = require('../models/log.js');
var BooksRank = require('../models/booksRank.js');

var router = express.Router();
var book = new Book();
var user = new User();
var log  = new Log();
var booksRank = new BooksRank();

router.get('/', function (req, res) {
  var page = req.query.page ? req.query.page : 1;

  async.parallel([
    function (cb) {
      booksRank.getAll({
        'key': 'collectTimes'
      }, function (err, books) {
        if (books) {
          var index = books.findIndex(function (book) {
            return book.collectTimes < 1;
          });
          if (index > -1) {
            books = books.slice(0, index);
          }
        }
        cb(err, books);
      });
    },
    function (cb) {
      booksRank.getAll({
        'key': 'searchTimes'
      }, function (err, books) {
        cb(err, books);
      });
    },
    function (cb) {
      book.getAll({}, {
        'page': page
      }, function (err, books, total) {
        cb(err, [books, total]);
      });
    }
  ], function (err, result) {
    if (err) {
      return res.send({
        success: false
      });
    }
    res.render('index', {
      title: '主页',
      user: req.session.user,
      mostCollectedBooks: result[0],
      mostSearchedBooks: result[1],
      books: result[2][0],
      page: parseInt(page, 10),
      pageNum: Math.ceil(result[2][1] / book.perPage),
      isFirstPage: page == 1,
      isLastPage: ((page - 1) * book.perPage + result[2][0].length >= result[2][1]),
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

});

router.get('/profile', checkLogin);
router.get('/profile', function (req, res) {
  if (!req.session.user) {
    return res.redirect('/');
  }
  return res.redirect('/profile/' + req.session.user.name);
});

router.get('/profile/:username', function(req, res, next) {
  var page = req.query.page ? req.query.page : 1;
  var username = '';

  if (req.session.user) {
    username = req.session.user.name;
  }

  async.parallel([
    function (cb) {
      book.getAll({
        username: req.params.username
      }, {
        'page': page
      }, function (err, books, total) {
        cb(err, [books, total]);
      });
    },
    function (cb) {
      user.get(req.params.username, function (err, _user) {
        cb(err, _user);
      });
    }
  ], function (err, result) {
    if (err) {
      return res.redirect('/');
    }
    res.render('profile', {
      title: '用户资料',
      user: req.session.user,
      userInfo: result[1],
      books: result[0][0],
      page: parseInt(page, 10),
      pageNum: Math.ceil(result[0][1] / book.perPage),
      isFirstPage: page == 1,
      isLastPage: ((page - 1) * book.perPage + result[0][0].length >= result[0][1]),
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

// router.get('/logs', function(req, res) {
//   var page = req.query.p ? parseInt(req.query.p, 10) : 1;

//   log.getAll({}, page, function (err, logs, total, page) {
//     if (!Array.isArray(logs)) {
//         logs = [];
//     }
//     res.render('log', {
//       title: '书单',
//       logs: logs,
//       user: req.session.user,
//       page: page,
//       isFirstPage: page <= 1,
//       isLastPage: ((page - 1) * log.perPage + logs.length) >= total,
//       success: req.flash('success').toString(),
//       error: req.flash('error').toString()
//     });
//   });
// });

router.get('/register', checkNotLogin);
router.get('/register', function (req, res) {
  res.render('register', {
    title: '注册',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/register', checkNotLogin);
router.post('/register', function (req, res) {
  user.get(req.body.name, function (err, _user) {
    if (_user) {
      req.flash('error', '用户已存在');
      return res.redirect('/register');
    }
    if (req.body.password != req.body.password2) {
      req.flash('error', '两次输入的密码不一致');
      return res.redirect('/register');
    }

    var verification = validateRegister(req.body.name, req.body.password, req.body.password2);

    if (!verification.success) {
      req.flash('error', verification.errMsg);
      return res.redirect('/register');
    } else {
      user.add(req.body, function (err) {
        if (err) {
          req.flash('error', '注册失败，请重试');
          return res.redirect('/register');
        }
        req.session.user = _user;
        req.flash('success', '注册成功');
        return res.redirect('/');
      });
    }
  });
});

router.get('/login', checkNotLogin);
router.get('/login', function (req, res) {
  res.render('login', {
    title: '登录',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/login', checkNotLogin);
router.post('/login', function (req, res) {
  var password = crypto.createHash('md5').update(req.body.password).digest('hex');

  user.get(req.body.name, function (err, _user) {
    if (!_user) {
      req.flash('error', '用户不存在');
      return res.redirect('/login');
    }
    if (_user.password != password) {
      req.flash('error', '密码错误');
      return res.redirect('/login');
    }
    req.session.user = _user;
    req.flash('success', '登录成功');
    res.redirect('/');
  });
});

router.get('/logout', checkLogin);
router.get('/logout', function (req, res) {
  req.session.user = null;
  req.flash('success', '注销成功');
  res.redirect('/');
});

router.get('/search', checkLogin);
router.get('/search', function (req, res) {
  res.render('search', {
    title: '搜索',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/search', checkLogin);
router.post('/search', function (req, res) {
  var body = req.body;

  booksRank.update({
    'name': body.name,
    'searchTimes': true
  }, function (err) {
    if (!err) {
      res.redirect('/book/' + encodeURIComponent(req.body.name));
    }
  });
});

router.get('/archive', checkLogin);
router.get('/archive', function (req, res) {
  res.redirect('/archive/' + encodeURIComponent(req.session.user.name));
});

router.get('/archive/:username', checkLogin);
router.get('/archive/:username', function (req, res) {
  var page = req.query.p ? parseInt(req.query.p, 10) : 1;

  book.getUserAll({
    username: req.params.username
  }, page, function (err, books, total) {
    if (!books || err) {
      req.flash('error', '获取书籍信息失败');
      return res.redirect('/');
    }
    res.render('archive', {
      title: '目录',
      books: books,
      user: req.session.user,
      username: req.params.username,
      page: page,
      isFirstPage: page <= 1,
      isLastPage: ((page - 1) * book.perPage + books.length) >= total,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.get('/book/:name', checkLogin);
router.get('/book/:name', function (req, res) {
  res.render('book', {
    title: req.params.name,
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/book', checkLogin);
router.post('/book', function (req, res) {
  var body = req.body;

  if (body._method && body._method === 'delete') {
    if (body.username !== req.session.user.name) {
      return;
    }
    book.remove({
      name: body.name,
      bookId: body.bookId,
      username: req.session.user.name
    }, function (err) {
      if (err) {
        return res.send({
          success: false
        });
      }
      return res.send({
        success: true
      });
    });
  } else {
    async.waterfall([
      function (cb) {
        book.get({
          bookId: body.bookId,
          username: req.session.user.name
        }, function (err, _book) {
          cb(err, _book);
        });
      },
      function (_book, cb) {
        if (_book) {
          req.flash('error', '已经收藏了此书籍');
          return res.send({
            success: false
          });
        }
        cb(null);
      },
      function (cb) {
        user.get(req.session.user.name, function (err, _user) {
          cb(err, _user);
        });
      },
      function (_user, cb) {
        var op = {
          name: body.name.replace(/\s/g, ''),
          author: body.author ? body.author.replace(/\s/g, '') : '',
          bookId: body.bookId,
          isbn10: body.isbn10,
          isbn13: body.isbn13,
          summary: body.summary,
          username: _user.name,
          img: body.img || '',
          userhead: _user.head
        };

        book.add(op, function (err) {
          cb(err);
        });
      },
      function (cb) {
        booksRank.update({
          'name': body.name,
          'collectTimes': true
        }, function (err) {
          cb(err);
        });
      }
    ], function (err) {
      if (err) {
        req.flash('error', '添加失败: ' + err);
        return res.send({
          success: false
        });
      }
      req.flash('success', '添加成功');
      res.send({
        success: true
      });
    });
  }
});

router.get('/comment/:username/:bookId', checkLogin);
router.get('/comment/:username/:bookId', function (req, res) {
  book.get({
    bookId: req.params.bookId,
    username: decodeURIComponent(req.params.username)
  }, function (err, _book) {
    if (!_book || err) {
      req.flash('error', '获取书籍信息失败');
      return res.redirect('/');
    }
    res.render('comment', {
      title: '笔记',
      user: req.session.user,
      book: _book,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.post('/comment', checkLogin);
router.post('/comment', function (req, res) {
  var body = req.body;

  if (body._method && body._method === 'delete') {
    book.removeComment({
      name: body.name,
      commentId: body.commentId,
      username: req.session.user.name
    }, function (err) {
      if (err) {
        res.send({
          success: false
        });
      } else {
        res.send({
          success: true
        });
      }
    });
  }
});

router.get('/editcomment/:username/:bookId', checkLogin);
router.get('/editcomment/:username/:bookId', function (req, res) {
  if (req.params.username !== req.session.user.name) {
    return res.redirect('/editcomment/' + req.session.user.name + '/' + req.params.bookId);
  }
  book.get({
    bookId: req.params.bookId,
    username: decodeURIComponent(req.session.user.name)
  }, function (err, _book) {
    if (!_book || err) {
      req.flash('error', '获取书籍信息失败');
      return res.redirect('back');
    }
    res.render('editcomment', {
      title: '笔记',
      user: req.session.user,
      book: _book,
      comments: _book.comments || [],
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.post('/editcomment/:username/:bookId', checkLogin);
router.post('/editcomment/:username/:bookId', function (req, res) {
  var body = req.body;

  book.addComment({
    bookId: req.params.bookId,
    username: req.session.user.name,
  }, {
    comment: body.comment,
    isPrivate: body.isPrivate ? true : false
  }, function (err, _book) {
    if (err) {
      req.flash('error', '提交失败');
      return res.redirect('back');
    }
    req.flash('success', '提交成功');
    res.redirect('/comment/' + req.session.user.name + '/' + req.params.bookId);
  });
});

function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', '请先登录');
    res.redirect('/login');
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash('error', '请先注销');
    res.redirect('back');
  }
  next();
}

function validateRegister(name, password, password2) {
  if (name.length < 6 || name.length > 16 || /^a-zA-Z0-9/.test(name)) {
    return {
      success: false,
      errMsg: '用户名长度不符合规范，应当是6-16位英文或数字的组合'
    };
  }
  if (password.length < 6 || password > 20 || password2.length < 6 || password2 > 20 || /^a-zA-Z0-9/.test(name)) {
    return {
      success: false,
      errMsg: '密码长度不符合规范，应当是6-20位英文或数字的组合'
    };
  }
  return {
    success: true
  };
}

module.exports = router;
