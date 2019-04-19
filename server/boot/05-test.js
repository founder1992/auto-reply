'use strict';

const fs = require('fs');
const request = require('request');
const PromiseA = require('bluebird');

module.exports = function (app) {
  // 模拟浏览器的 localStorage 对象
  var localStorage = {};

  // 练习 1
  // ==========
  // 写一个函数，使用 Maybe 和 ap() 实现让两个可能是 null 的数值相加。

  //  ex1 :: Number -> Number -> Maybe Number
  var ex1 = _.liftA2(_.add);

  // console.log(ex1(_.Maybe.of(1), _.Maybe.of(2)));


  var ex2 = function (x, y) {
    return _.Maybe.of(_.add).ap(_.Maybe.of(x)).ap(_.Maybe.of(y))
  };


  function getPost(i) {
    return new _.Task(function (rej, res) {
      setTimeout(function () { res({ id: i, title: 'Love them futures' }); }, 300);
    });
  }

  function getComments(i) {
    return new _.Task(function (rej, res) {
      setTimeout(function () {
        res(["This book should be illegal", "Monads are like space burritos"]);
      }, 300);
    });
  }


  // 练习 3
  // ==========
  // 运行 getPost(n) 和 getComments(n)，两者都运行完毕后执行渲染页面的操作。（参数 n 可以是任意值）。
  var makeComments = _.reduce(function(acc, c){ return acc+"<li>"+c+"</li>" }, "");
  var render = _.curry(function(p, cs) { return "<div>"+p.title+"</div>"+makeComments(cs); });

  //  ex3 :: Task Error HTML
  var ex3 = _.liftA2(render, getPost(1), getComments(2));

  var exn = _.compose(_.fork((data) => {console.log(4444, data)}), _.chain((i) => {console.log(88888, i);return _.Task.of(i)}), getPost);

  // console.log(666, exn(1));
  ex3.fork(() => {}, (data) => {console.log(4444, data)});

  // 练习 4
  // ==========
  // 写一个 IO，从缓存中读取 player1 和 player2，然后开始游戏。

  localStorage.player1 = "toby";
  localStorage.player2 = "sally";

  var getCache = function(x) {
    return new _.IO(function() { return localStorage[x]; });
  }


  var game = _.curry(function(p1, p2) { return p1 + ' vs ' + p2; });

  //  ex4 :: IO String
  var ex4 = _.liftA2(game, getCache("player1"), getCache("player2"));

  console.log(_.join(ex4));


  // // 使用 _.add(x,y) 和 _.map(f,x) 创建一个能让 functor 里的值增加的函数
  // let ex1 = _.map(_.add(1));
  //
  // let id1 = Identity.of(1);
  //
  // let xs = Identity.of(['do', 'ray', 'me', 'fa', 'so', 'la', 'ti', 'do']);
  //
  // // 使用 _.head 获取列表的第一个元素
  // let ex2 = _.map(_.head);
  //
  // // 使用 safeProp 和 _.head 找到 user 的名字的首字母
  // let safeProp = _.curry(function (x, o) { return Maybe.of(o[x]); });
  //
  // let user = { id: 2, name: "Albert" };
  //
  // let ex3 = _.compose(_.map(_.head), safeProp("name"));
  //
  // // 使用 Maybe 重写 ex4，不要有 if 语句
  // let ex4 = function (n) {
  //   if (n) { return parseInt(n); }
  // };
  //
  // ex4 = _.compose(_.map(parseInt), Maybe.of);
  //
  // // 写一个函数，先 getPost 获取一篇文章，然后 toUpperCase 让这片文章标题变为大写
  //
  // // getPost :: Int -> Future({id: Int, title: String})
  // const getPost = function (i) {
  //   return new Task(function(rej, res) {
  //     setTimeout(function(){
  //       res({id: i, title: 'Love them futures'})
  //     }, 300)
  //   });
  // };
  //
  // let ex5t = _.compose(_.toUpper, _.prop("title"));
  //
  // let ex5 = _.compose(_.map(ex5t), getPost);
  //
  // // 写一个函数，使用 checkActive() 和 showWelcome() 分别允许访问或返回错误
  // const add = _.curry((t1, t2) => {
  //   return t1 + t2;
  // });
  //
  // var showWelcome = _.compose(add( "Welcome "), trace("hahah"), _.prop('name'));
  //
  // var checkActive = function(user) {
  //   return user.active ? Right.of(user) : Left.of('Your account is not active')
  // };
  //
  // var ex6 = _.compose(_.map(showWelcome), checkActive);
  //
  //
  // // 写一个验证函数，检查参数是否 length > 3。如果是就返回 Right(x)，否则就返回
  // var ex7 = function(x) {
  //   return x > 3 ? Right.of(x) : Left.of("You need > 3") // <--- write me. (don't be pointfree)
  // }
  //
  //
  // // 使用练习 7 的 ex7 和 Either 构造一个 functor，如果一个 user 合法就保存它，否则
  // // 返回错误消息。别忘了 either 的两个参数必须返回同一类型的数据。
  //
  // var save = function(x){
  //   return new IO(function(){
  //     console.log("SAVED USER!");
  //     return x + '-saved';
  //   });
  // };
  //
  // var checkUser = function (user) {
  //   return user.active ? Right.of(user) : Left.of('Your account is not active')
  // };
  //
  // let ex8 = _.compose(either(console.log, _.map), _.map(save), _.map(_.prop("name")) ,checkUser);
  //
  // var ex9 = _.compose(join, either(IO.of, save), ex7);
  //
  //
  // // 练习 1
  // // ==========
  // // 给定一个 user，使用 safeProp 和 map/join 或 chain 安全地获取 street 的 name
  //
  // var monadSafeProp = _.curry(function (x, o) { return Maybe.of(o[x]); });
  // var monadUser = {
  //   id: 2,
  //   name: "albert",
  //   address: {
  //     street: {
  //       number: 22,
  //       name: 'Walnut St'
  //     }
  //   }
  // };
  //
  // var monadex1 = _.compose(join, chain(monadSafeProp("name")), chain(monadSafeProp("street")), monadSafeProp("address"));
  //
  //
  // // 练习 2
  // // ==========
  // // 使用 getFile 获取文件名并删除目录，所以返回值仅仅是文件，然后以纯的方式打印文件
  //
  // var getFile = function() {
  //   return new IO(function(){ return __filename; });
  // };
  //
  // var pureLog = function(x) {
  //   return new IO(function(){
  //     console.log(x);
  //     return 'logged ' + x;
  //   });
  // };
  //
  // var monadex2 = _.compose(join, chain(pureLog), getFile);
  //
  // // 练习 3
  // // ==========
  // // 使用 getPost() 然后以 post 的 id 调用 getComments()
  // var monadGetPost = function(i) {
  //   return new Task(function (rej, res) {
  //     setTimeout(function () {
  //       res({ id: i, title: 'Love them tasks' });
  //     }, 300);
  //   });
  // };
  //
  // var monadGetComments = function(i) {
  //   return new Task(function (rej, res) {
  //     setTimeout(function () {
  //       res([
  //         {post_id: i, body: "This book should be illegal"},
  //         {post_id: i, body: "Monads are like smelly shallots"}
  //       ]);
  //     }, 300);
  //   });
  // };
  //
  //
  // var monadex3 = _.compose(fork(trace("2222")), chain(_.compose(monadGetComments, _.prop("id"))), monadGetPost);
  //
  // // 练习 4
  // // ==========
  // // 用 validateEmail、addToMailingList 和 emailBlast 实现 ex4 的类型签名
  //
  // //  addToMailingList :: Email -> IO([Email])
  // var addToMailingList = (function(list){
  //   return function(email) {
  //     return new IO(function(){
  //       list.push(email);
  //       return list;
  //     });
  //   }
  // })([]);
  //
  // function emailBlast(list) {
  //   return new IO(function(){
  //     return 'emailed: ' + list.join(',');
  //   });
  // }
  //
  // var validateEmail = function(x){
  //   return x.match(/\S+@\S+\.\S+/) ? (new Right(x)) : (new Left('invalid email'));
  // }
  //
  // //  ex4 :: Email -> Either String (IO String)
  // var monadex4 = _.compose(join, either(IO.of, _.compose(chain(emailBlast), addToMailingList)), validateEmail);
  //
  // console.log(monadex4("334343@qqcom"))
};
