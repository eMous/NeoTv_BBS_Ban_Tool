<h2 align="center">你也想<s>(假装)</s>享受Tager和小黄权限别人的快乐？</h2>
<p><a href="http://bbs.niuyou5.com/home.php?mod=space&uid=2122242" target="_blank" rel="noopener noreferrer"><img src="http://uc.neotv.com.cn/avatar.php?uid=2122242&size=big"></a></p>

**author: anon**

![](https://img.shields.io/github/tag-date/eMous/NeoTv_BBS_Ban_Tool.svg)

这个工具可以在你登录[NeoTV论坛](http://bbs.niuyou5.com)后为你提供屏蔽用户的功能。

#### 现有功能
功能开启的前提是当前Web页已经登录到牛坛，现有功能分为Web界面操作和键盘输入两种输入方式。

##### Web界面操作
- 点选用户直接屏蔽
 <p align="center"><img width="1080"src="https://raw.githubusercontent.com/eMous/__ResourceRepository/master/NeoTv_BBS_Ban_Tool/1553483311.jpg"></p>
 

##### 键盘输入操作
启用插件后，会对整个页面内部进行键盘监听。并维护一个长度为`KEY_LISTEN_SIZE`（设置为20在文件中搜索`常量`，可以自行修改）输入队列，当现有命令列表中的命令能匹配到输入队列时触发命令（**无需回车**，字母和数字以外的键盘字符不会被收录到队列里）。

如果输入错误没有任何关系，重新把你要输入的命令输入即可（**请自行确保杜绝出现意料之外的子串匹配，尤其是当你选择自定义你的命令的时候**）。你可以通过**开发者工具的控制台**看到实时输入队列的内容。
<p align="center"><img width="1080"src="https://raw.githubusercontent.com/eMous/__ResourceRepository/master/NeoTv_BBS_Ban_Tool/15534848382.jpg"></p>


###### 命令列表 <功能(js文件中的常量名)>：
- 清除所有屏蔽的用户(CLEAR_COMMAND)
键入CLEAR

- 屏蔽特定UID的用户(BAN_UID)
键入BAN_UID<用户UID>P
例如：BANUID110P

- 解除屏蔽特定UID的用户(FREE_UID)
键入FREEUID<用户UID>P
例如：FREEUID110P

- 显示屏蔽列表在开发者工具控制台中(SHOW_BAN_LIST)
键入SHOWBANLIST

- 开关策略，决定是否在主页过滤屏蔽列表中用户作为楼主的帖子(BAN_POST)
键入BAN_POST

- 从NeoTV个人数据中下载屏蔽列表到本地(DOWNLOAD_LIST)
键入DOWNLOADLIST

- 从本地上传屏蔽列表到NeoTV个人数据<公司>中(UPLOAD_LIST)
键入UPLOADLIST

###### 自定义命令常量：
请务必确保你在JS脚本中设置的常量值是: **大写字母组成的字符串**。

#### 相关存储
当前列表都存储在本地，浏览器cache清除后列表即被清空。

### TODO
- 节操值过滤。
- 用户空间页面注册添加或解除屏蔽按钮。
