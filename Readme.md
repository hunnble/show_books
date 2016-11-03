# 用Express+jQuery+Less写的图书收藏/分享网站, 并没有名字。

[demo](https://cryptic-inlet-93576.herokuapp.com/)
发布是用heroku和mongolab，所以梯子不高可能打不开哈。
pc和移动端都可以打开。

### 主要功能：

* 注册登录
* 个人设置
* 读写笔记
* 根据书名搜索图书信息(豆瓣)

### todo：

* 笔记分页, 缩略
* 用户之间的交流
* 书籍打分、推荐

### 从源码构建

```shell
git clone https://github.com/hunnble/show_books.git
cd '项目路径'
npm install
```
然后打开浏览器输入127.0.0.1:3000就可以了
如果想用自己本地的数据库就改一下settings.js, 把url换成我注释的那行就可以了。
MongoDB表名和三个文档名也都在settings.js中。
