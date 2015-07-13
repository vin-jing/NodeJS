
/*
 * GET home page.
 */
var crypto = require('crypto');
var Post = require('../models/post.js');
var User = require('../models/user.js');

module.exports = function(app) {
    app.get('/', function(req, res) {
		Post.get(null, function(err, posts) {
			if (err) {
				posts = [];
			}
   	     	res.render('index', {
   	       	  title: '首页',
			  posts: posts,
			  user: req.session.user,
			  success: req.flash('success').toString(),
			  error: req.flash('error').toString()
  	     	});
  	  	});
	});

    app.get('/reg',checkNotLogin);
    app.get('/reg', function(req, res) {
        res.render('reg', {
            title: '用户注册',
        });
    });
    
    app.post('/reg', checkNotLogin);
    app.post('/reg', function(req, res) {
	// 检测两次用户输入的口令是否一致
		if (req.body['password-repeat'] != req.body['password']) {
			req.flash('error', '两次输入的口令不一致');
			return res.redirect('/reg');
		}

        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');

        var newUser = new User({
            name:req.body.username,
                    password:password,
        });

        User.get(newUser.name,function(err, user){
            if (user)
                err = 'Username already exists.';
            if (err){
				req.flash('error', err);
                //req.session.error = err;
                return res.redirect('/reg');
            }
            newUser.save(function(err){
                if(err){
					req.flash('error', err);
                    //req.session.error = err;
                    return res.redirect('/reg');
                } 
                req.session.user = newUser;
                req.session.success = '注册成功！';
                res.redirect('/');
                });
            });
    });
    app.get('/login',checkNotLogin);
    app.get('/login',function(req, res){
		console.log("login");
        res.render('login',{
            title:'用户登入',
            });
        });

    app.post('/login',checkNotLogin); 
    app.post('/login',function(req, res){
         var md5 = crypto.createHash('md5');
         var password = md5.update(req.body.password).digest('base64');

         User.get(req.body.username,function(err,user){
            if(!user){
				req.flash('error', '用户不存在');
                 //req.session.error = '用户不存在';
                 return res.redirect('/login');
             }
         if(user.password != password){
			req.flash('error', '用户口令错误');
              //req.session.error = '用户名与密码不匹配！';
              return res.redirect('/login');
         }
         req.session.user = user;
		 req.flash('success', '登入成功');
         //req.session.success = '登陆成功';
         res.redirect('/');
         });
    });
    app.get('/logout',checkLogin);
    app.get('/logout',function(req,res){
        req.session.user = null;
        req.session.success = '登出成功';
        res.redirect('/');
    });

	app.post('/post', checkLogin);
	app.post('/post', function(req, res) {
		var currentUser = req.session.user;
		var post = new Post( currentUser.name, req.body.post);
		post.save(function(err,result) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			console.log('callback');
			console.log(err,result);
			req.flash('success', '发表成功');
			res.redirect('/u/' + currentUser.name);
		});
	});
	app.get('/u/:user', function(req, res) {
		User.get(req.params.user, function(err, user) {
			if (!user) {
				req.flash('error', '用户不存在');
				return res.redirect('/');
			}
			Post.get(user.name, function(err, posts) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/');
				}
				res.render('user', {
					title: user.name,
					posts: posts,
				});
			});
		});
	});
};
    
function checkLogin(req, res, next) {
	console.log('check***');
		if (!req.session.user) {
				req.flash('error', '未登入');
				//req.session.error = '未登录';
				return res.redirect('/login');
		}
		next();
}

function checkNotLogin(req, res, next) {
		if(req.session.user) {
				req.flash('error', '已登入');
				//req.session.error = '已登录';
				return res.redirect('/');
		}
		next();
}
