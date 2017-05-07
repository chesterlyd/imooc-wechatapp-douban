var postsData = require("../../../data/posts-data.js")
var app = getApp();
Page({
    data: {
        isPlayingMusic: false
    },
    onLoad: function (option) {
        var postId = option.id;
        this.setData({
            currentPostId: postId
        })
        var postData = postsData.postList[postId];
        this.setData(postData);

        var postsCollected = wx.getStorageSync('posts_collected');
        if (postsCollected) {
            var postCollected = postsCollected[postId];
            this.setData({
                collected: postCollected
            });
        } else {
            var postsCollected = {};
            postsCollected[postId] = false;
            wx.setStorageSync('posts_collected', postsCollected);
        }
        if(app.globalData.g_isPlayingMusic && app.globalData.g_currentMusicPostId === postId){
            this.setData({
                isPlayingMusic:true
            })
        }

        this.setMusicMonitor();
        
    },

    //点击收藏按纽
    onColletionTap: function (event) {
        var postsCollected = wx.getStorageSync('posts_collected');
        var postCollected = postsCollected[this.data.currentPostId];
        postCollected = !postCollected;
        postsCollected[this.data.currentPostId] = postCollected;
        this.showToast(postsCollected, postCollected);
    },
    //提示窗
    showToast: function (postsCollected, postCollected) {
        wx.setStorageSync('posts_collected', postsCollected);
        this.setData({
            collected: postCollected
        });
        wx.showToast({
            title: postCollected ? '收藏成功' : '取消收藏'
        })
    },
    //对话窗
    showModal: function (postsCollected, postCollected) {
        var that = this;
        wx.showModal({
            title: '收藏',
            content: postCollected ? '是否收藏该文章？' : '是否取消收藏该文章？',
            cancelText: '否',
            confirmText: '是',
            success: function (res) {
                if (res.confirm) {
                    wx.setStorageSync('posts_collected', postsCollected);
                    that.setData({
                        collected: postCollected
                    });
                }
            }
        })
    },
    //分享按纽
    onShareTap: function (event) {
        wx.showActionSheet({
            itemList: [
                '分享到朋友圈',
                '分享给微信好友',
                '分享到QQ空间'
            ]
        })
    },
    //播放音乐
    onMusicTap: function (event) {
        var currentPostId = this.data.currentPostId;
        var postData = postsData.postList[currentPostId];
        var isPlayingMusic = this.data.isPlayingMusic;
        if (isPlayingMusic) {
            wx.pauseBackgroundAudio();
            this.setData({
                isPlayingMusic: false
            });
        }
        else {
            wx.playBackgroundAudio({
                dataUrl: postData.music.url,
                title: postData.music.title,
                coverImgUrl: postData.music.coverImg
            });
            this.setData({
                isPlayingMusic: true
            });
        }
    },
    //监听音乐播放状态
    setMusicMonitor: function () {
        var that = this;
        wx.onBackgroundAudioPlay(function () {
            that.setData({
                isPlayingMusic: true
            });
            app.globalData.g_isPlayingMusic = true;
            app.globalData.g_currentMusicPostId = that.data.currentPostId;
        })
        wx.onBackgroundAudioPause(function () {
            that.setData({
                isPlayingMusic: false
            });
            app.globalData.g_isPlayingMusic = false;
            app.globalData.g_currentMusicPostId = null;
        })
        wx.onBackgroundAudioStop(function () {
            that.setData({
                isPlayingMusic: false
            });
            app.globalData.g_isPlayingMusic = false;
            app.globalData.g_currentMusicPostId = null;
        })
    }

})