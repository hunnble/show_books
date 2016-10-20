var express = require('express');
var router = express.Router();

var async = require('async');
var rqst = require('superagent');
var crypto = require('crypto');
var markdown = require('markdown').markdown;

var Book = require('../models/book.js');
var User = require('../models/user.js');
var Log  = require('../models/log.js');

var book = new Book();
var user = new User();
var log  = new Log();

router.get('/', function (req, res) {
  res.render('index', {
    title: '主页',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
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
  user.get(req.body['name'], function (err, _user) {
    if (_user) {
      req.flash('error', '用户已存在');
      return res.redirect('/register');
    }
    if (req.body['password'] != req.body['password2']) {
      req.flash('error', '两次输入的密码不一致');
      return res.redirect('/register');
    }
    var verification = validateRegister(req.body['name'], req.body['password'], req.body['password2']);
    if (!verification.success) {
      req.flash('error', verification.errMsg);
      return res.redirect('/register');
    } else {
      user.add(req.body['name'], req.body['password'], req.body['email'], function (err) {
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
  var password = crypto.createHash('md5').update(req.body['password']).digest('hex');

  user.get(req.body['name'], function (err, user) {
    if (!user) {
      req.flash('error', '用户不存在');
      return res.redirect('/login');
    }
    if (user.password != password) {
      req.flash('error', '密码错误');
      return res.redirect('/login');
    }
    req.session.user = user;
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

router.get('/add_book', checkLogin);
router.get('/add_book', function (req, res) {
  res.render('add_book', {
    title: '新增书籍',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/add_book', checkLogin);
router.post('/add_book', function (req, res) {
  res.redirect('/book/' + encodeURI(req.body.name));
  // async.waterfall([
    // function (cb) {
    //   book.get({
    //     name: req.body.name,
    //     username: req.session.user.name
    //   }, function (err, _book) {
    //     cb(err, _book);
    //   });
    // },
    // function (_book, cb) {
    //   if (_book) {
    //     req.flash('error', '书籍已存在');
    //     return res.redirect('/add_book');
    //   }
    //   cb();
    // },
    // function (cb) {
    //   rqst
    //     .get('https://api.douban.com/v2/book/search')
    //     .query({
    //       q: req.body.name,
    //       count: 1
    //     })
    //     .end(function (err, res) {
    //       cb(err, res);
    //     });
    // },
    // function (res, cb) {
    //   var op = {
    //     name: req.body.name,
    //     author: req.body.author,
    //     username: req.session.user.name,
    //     img: ''
    //   };
    //   if (res.status == 200 && res.body.books.length > 0 && res.body.books[0].image) {
    //     op.img = res.body.books[0].images.large;
    //   }
    //   book.add(op, function (err) {
    //     cb(err);
    //   });
    // },
    // function (cb) {
    //   log.add(req.session.user.name, new Date(), 'add', req.body.name, '/book/' + req.body.name + '/' + req.body.author, function (err) {
    //     cb(err);
    //   });
    // }
  // ], function (err) {
    // if (err) {
    //   req.flash('error', '添加失败: ' + err);
    //   return res.redirect('/add_book');
    // }
    // req.flash('success', '添加成功');
    // res.redirect('/');
  // });
});

router.get('/archive', checkLogin);
router.get('/archive', function (req, res) {
  res.redirect('/archive/' + encodeURI(req.session.user.name));
});

router.get('/archive/:username', checkLogin);
router.get('/archive/:username', function (req, res) {
  var page = req.query.p ? parseInt(req.query.p, 10) : 1;

  // book.getAll(req.session.user.name, page, function (err, books, total) {
  book.getAll(req.params.username, page, function (err, books, total) {
    if (!books) {
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

router.post('/archive', checkLogin);
router.post('/archive', function (req, res) {
  if (req.body.username !== req.session.user.name) {
    return;
  } else if(req.body.commentId) {
    book.removeComment(req.body.name, req.body.author, req.body.commentId, req.session.user.name, function (err) {});
  } else {
    book.remove({
      name: req.body.name,
      bookId: req.body.bookId,
      username: req.session.user.name
    }, function (err) {});
    log.add(req.session.user.name, new Date(), 'remove', req.body.name, '', function (err) {});
  }
});

router.get('/book/:name', checkLogin);
router.get('/book/:name', function (req, res) {
  // book.get({
  //   name: req.params.name,
  //   author: req.params.author,
  //   username: req.session.user.name
  // }, function (err, _book) {
  //   if (!_book) {
  //     req.flash('error', '获取书籍信息失败');
  //     return res.redirect('/');
  //   }
  //   res.render('book', {
  //     title: _book.name,
  //     user: req.session.user,
  //     success: req.flash('success').toString(),
  //     error: req.flash('error').toString()
  //   });
  // });
  res.render('book', {
    title: req.params.name,
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/book', checkLogin);
router.post('/book', function (req, res) {
  async.waterfall([
    function (cb) {
      book.get({
        bookId: req.body.bookId,
        username: req.session.user.name
      }, function (err, _book) {
        cb(err, _book);
      });
    },
    function (_book, cb) {
      if (_book) {
        req.flash('error', '已收藏过此书籍');
        return res.send({
          success: false
        });
      }
      cb(null);
    },
    function (cb) {
      var op = {
        name: req.body.name,
        author: req.body.author || '',
        bookId: req.body.bookId,
        isbn10: req.body.isbn10,
        isbn13: req.body.isbn13,
        username: req.session.user.name,
        img: req.body.img || ''
      };
      book.add(op, function (err) {
        cb(err);
      });
    },
    function (cb) {
      log.add(req.session.user.name, new Date(), 'add', req.body.name, '/book/' + req.body.name + '/' + req.body.author, function (err) {
        cb(err);
      });
    }
  ], function (err) {
    if (err) {
      req.flash('error', '添加失败: ' + err);
      // return;
      res.send({
        success: false
      });
    }
    req.flash('success', '添加成功');
    res.send({
      success: true
    });
  });
});

router.get('/add_comment/:name/:author', checkLogin);
router.get('/add_comment/:name/:author', function (req, res) {
  book.get({
    name: req.params.name,
    author: req.params.author,
    username: req.session.user.name
  }, function (err, _book) {
    if (!_book || err) {
      req.flash('error', '获取书籍信息失败');
      return res.redirect('/');
    }
    res.render('add_comment', {
      title: '评论<<' + _book.name + '>>',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.post('/add_comment/:name/:author', checkLogin);
router.post('/add_comment/:name/:author', function (req, res) {
  if (req.body.isAjax) {
    res.send(markdown.toHTML(req.body.comment));
  } else {
    book.addComment({
      name: req.params.name,
      author: req.params.author,
    }, req.body.comment, req.session.user.name, function (err, _book) {
      if (err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      log.add(req.session.user.name, new Date(), 'comment', req.body.name, '/comment/' + _book.name + '/' + _book.author, function (err) {});
      req.flash('success', '评论成功');
      res.redirect('/archive');
    });
  }
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
  if (password.length < 6 || password > 20 || password2.length < 6 || password2 > 20) {
    return {
      success: false,
      errMsg: '密码长度不符合规范，应当是6-20位'
    };
  }
  return {
    success: true
  };
}

module.exports = router;
