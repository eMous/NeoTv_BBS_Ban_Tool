// ==UserScript==
// @name         NeoTv Ban Tool
// @namespace    http://tampermonkey.net/
// @version      0.1
// @require      https://code.jquery.com/jquery-2.1.4.min.js

// @description  NeoTv BBS 屏蔽工具
// @author       anon
// @match        *://bbs.niuyou5.com/*
// @connect      niuyou5.com
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest

// ==/UserScript==

// ----functions----
function UniqueArrary(arr) {
    var hash = [];
    for (var i = 0; i < arr.length; i++) {
        if (hash.indexOf(arr[i]) == -1) {
            hash.push(arr[i]);
        }
    }
    return hash;
}

// ----持久化存储----
const KEY_BAN_ID_LIST = "ban_id_list"
const KEY_BAN_POST = "ban_post"

// ----常量----
const KEY_LISTEN_SIZE = 20
// 口令常量(务必设置成大写字母)
const CLEAR_COMMAND = "CLEAR" // 清除屏蔽名单：输入CLEAR
const BAN_UID = "BANUID" // 屏蔽特定UID:输入(P结尾)BANUID123456P
const FREE_UID = "FREEUID" // 取消屏蔽特定UID：输入(P结尾)FREEUID123456P
const SHOW_BAN_LIST = "SHOWBANLIST" // 显示屏蔽列表：输入SHOWBANLIST
const BAN_POST = "BANPOST" // 在主页过滤屏蔽列表中用户作为楼主发布的帖子
const POST_PAGE = "POST_PAGE"
const INDEX_PAGE = "INDEX_PAGE"
// 屏蔽列表
var ban_id_list
var ban_post

// 键盘输入队列
var key_sequence
// 当前页面
var current_page



(function () {
    'use strict';

//     GM_xmlhttpRequest({ //获取列表
//         method : "POST",
//     //   headers: {"Accept": "application/json"},
//       url : "http://bbs.niuyou5.com/home.php?mod=space&uid=2122242",
//         onload : function (response) {
//            console.log(response.responseText);
//       }
//    });

    var myID
    // 判断自身是否登陆
    function hasLogged() {
        var has_logged = false
        var current_page_url = window.location.href

        // 首页
        var ele = $("div#threadlist ul#thread_types")
        if (ele.length != 0) {
            current_page = INDEX_PAGE
            var atags = $("div.user_box_block a:visible")
            for (var i = 0, length = atags.length; i < length; ++i) {
                // 存在进入空间按钮，则已登陆
                var hrefs_str = $(atags[i]).attr("href")
                if (new RegExp(/mod=space/).test(hrefs_str)) {
                    var temp = hrefs_str.split("uid=")[1]
                    if (temp && !isNaN(temp)) {
                        myID = temp
                        has_logged = true
                    }
                }
            }
            return has_logged
        }
        // post页
        var res = new RegExp(/mod=viewthread/).test(current_page_url)
        if (res) {
            current_page = POST_PAGE
            var atags = $("div.login_yet a:visible")
            for (var i = 0, length = atags.length; i < length; ++i) {
                // 存在进入空间按钮，则已登陆
                var hrefs_str = $(atags[i]).attr("href")
                if (new RegExp(/mod=space/).test(hrefs_str)) {
                    var temp = hrefs_str.split("uid=")[1]
                    if (temp && !isNaN(temp)) {
                        myID = temp
                        has_logged = true
                    }
                }
            }
            return has_logged
        }
        // // 个人信息页
        // res = new RegExp(/mod=space/).test(current_page_url)
        // if(res){
        // }

        return false;
    }

    // 添加屏蔽按钮
    function injectBanTag(name_tag) {
        var id = name_tag.find("a").attr("href").split("uid=")[1]
        var name = name_tag.find("a").text()
        var button_append = $("<button>屏蔽</button>")
        button_append.attr("id", id + "分隔符###分隔符" + name)
        button_append.attr("class", "ban_uid")
        $(name_tag).append(button_append)
        // 使用button_append而不是$("button#"+id)，因为有可能DOM还没有解析完成，这样的话Button的监听注册就会失效
        button_append.click(function (event) {
            var return_val = event.target.id.split("分隔符###分隔符")
            // 0是uid，1是用户名
            ban_id_list[return_val[0]] = return_val[1]
            GM_setValue(KEY_BAN_ID_LIST, JSON.stringify(ban_id_list))
            window.location.reload()
        })
    }

    // 执行键盘事件处理口令
    function keyBoardDeal() {
        key_sequence = new Array()
        document.onkeydown = function (e) {
            // 忽略大小写（防止浏览器不兼容）
            var value = String.fromCharCode(e.keyCode);
            if (/[A-Za-z0-9]/.test(value)) {
                key_sequence.push(value.toUpperCase())
                if (key_sequence.length > KEY_LISTEN_SIZE) {
                    key_sequence.shift()
                }
            }
            var keycode_queue = key_sequence.join("")
            console.log("当前口令队列为:" + keycode_queue);

            // 解析口令
            parseKeyCode(keycode_queue)
        }
    }

    // 口令解析
    function parseKeyCode(keycode_queue) {
        var checkKeycode = function (keycode_queue, COMMAND) {
            return keycode_queue.search(COMMAND) != -1
        }

        // 清除所有屏蔽指令
        var ret = checkKeycode(keycode_queue, CLEAR_COMMAND)
        if (ret) {
            key_sequence = new Array()
            GM_setValue(KEY_BAN_ID_LIST, JSON.stringify({}))
            alert("成功清除屏蔽名单")
            window.location.reload()
            return
        }

        // 屏蔽特定某UID指令
        var ret = keycode_queue.split(BAN_UID)
        if (ret.length == 2) {
            if (ret[1].search("P") != -1) {
                var ret_1 = ret[1].split("P")
                var uid_to_ban = ret_1[0]
                if (!isNaN(uid_to_ban) && uid_to_ban) {
                    key_sequence = new Array()
                    if (!(uid_to_ban in ban_id_list)) {
                        ban_id_list[uid_to_ban] = "undefined_registered_mannually"
                        GM_setValue(KEY_BAN_ID_LIST, JSON.stringify(ban_id_list))
                        alert("屏蔽成功（请自行确保UID的正确性）")
                        window.location.reload()
                    }
                }
            }
            return
        }

        // 解除屏蔽特定某UID指令
        var ret = keycode_queue.split(FREE_UID)
        if (ret.length == 2) {
            if (ret[1].search("P") != -1) {
                var ret_1 = ret[1].split("P")
                var uid_to_free = ret_1[0]
                if (!isNaN(uid_to_free) && uid_to_free) {
                    key_sequence = new Array()
                    if (uid_to_free in ban_id_list) {
                        delete ban_id_list[uid_to_free]
                        GM_setValue(KEY_BAN_ID_LIST, JSON.stringify(ban_id_list))
                        alert("解除成功（请自行确保UID的正确性）")
                        window.location.reload()
                    } else {
                        alert("该UID未被屏蔽")
                    }
                }
            }
            return
        }

        // 显示ban_id_list
        var ret = keycode_queue.split(SHOW_BAN_LIST)
        if (ret.length == 2) {
            key_sequence = new Array()
            var str_ban_list = JSON.stringify(ban_id_list)
            console.log("屏蔽列表:" + str_ban_list)
            alert("屏蔽列表已显示在控制台")
            return
        }

        // 切换ban_post
        var ret = keycode_queue.split(BAN_POST)
        if (ret.length == 2) {
            key_sequence = new Array()
            ban_post = !ban_post
            GM_setValue(KEY_BAN_POST, ban_post)
            alert("ban_post状态:" + ban_post)
            window.location.reload()
        }

    }

    // ----逻辑部分----
    // 如果没登陆，插件无效
    if (!hasLogged()) {
        return
    }
    keyBoardDeal()
    // 提取持久化数据
    ban_id_list = JSON.parse(GM_getValue(KEY_BAN_ID_LIST, "{}"))
    ban_post = GM_getValue(KEY_BAN_POST, false)
    // 如果在文章页面
    if (current_page == POST_PAGE) {
        var post_list = $("#postlist").children("div[id^='post_']")
        post_list.each(function (index, element) {
            // 获取发帖人ID
            var id_href = $(element).find("div.authi:first a").attr("href")
            var id = id_href.replace(/[^0-9]/ig, "")
            if (id in ban_id_list) {
                element.remove()
            } else {
                var name_tag = $(element).find("td.pls div.authi")
                injectBanTag(name_tag)
            }
        })
    }

    // 如果在主页
    if (current_page == INDEX_PAGE) {
        if (ban_post) {
            var tbody_list = $("tbody[id*='thread']")
            tbody_list.each(function (index, element) {
                var id_href = $(element).find("td.by cite a:first").attr("href")
                var id = id_href.replace(/[^0-9]/ig, "")
                if (id in ban_id_list) {
                    element.remove()
                }
            })
        }
    }


})();