/**
 * Created by ZHY on 2017/6/10.
 */
    (function (fn) {

        fn($);

    })(function ($) {

        //这个canvas是缓存图片用的;
        var canvas = document.createElement("canvas");
        //在这里调图片的大小
        var minScreenWidth = Math.min(document.documentElement.clientWidth * 2 / 3, document.documentElement.clientHeight * 2 / 3);
//        alert(minScreenWidth)
        canvas.width = minScreenWidth;
        canvas.height = minScreenWidth;
        document.getElementById("content").style.width = minScreenWidth + "px";
        //保存了所有的block;
        var blocks = [];

        //工具方法
        var util = {
            /**
             * @desc 图片加载成功的话就执行回调函数
             * @param 图片地址 || 图片的DataUrl数据;
             */
            loadImg: function (e, fn) {

                var img = new Image;
                if (typeof e !== "string") {
                    img.src = ( e.srcElement || e.target ).result;
                } else {
                    img.src = e;
                }
                ;

                img.onload = function () {
                    //canvas.width = img.width;
                    //canvas.height = img.height;
                    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
                    //document.body.appendChild( canvas );
                    //document.getElementById("content").appendChild( canvas );
                    fn && fn();
                };

            }
        };

        //绑定事件;
        function bindEvents() {

            var file = $("#file");

            file.bind("change", function (ev) {
                var reader = new FileReader;
                reader.onload = function (e) {
                    util.loadImg(e, function () {
                        window.clipImage = new ClipImage(canvas, numbers[window.lev]);
                        window.clipImage.random();
                        Controller(window.clipImage, numbers[window.lev]);
                    });
                };
                reader.readAsDataURL(this.files[0]);
            });

        };

        //游戏关卡的图片和游戏每一个关卡要切成的图片快个数
        var levels = ["images/荷花.jpg", "images/3.jpg", "images/1.jpg", "images/1.jpg"];
        var numbers = [3, 4, 5, 6];

        /**
         *  @desc 把图片通过canvas切成一块块;
         */
        function ClipImage(canvas, number) {

            //blocks是一个二维数组，保存的是所有的canvas方块;
            this.blocks = [];
            //instances是一维数组，保存的是实例化的数组;
            this.instances = [];
            this.maps = {};
            this.canvas = canvas;
            this.context = this.canvas.getContext("2d");
            this.number = number;
            this.clip();

        };

        $.extend(ClipImage.prototype, {
            /**
             * @desc 根据关卡把图片canvas切成块canvas
             * 然后渲染到DOM;
             * */
            clip: function () {

                var avW = this.avW = this.canvas.width / this.number;
                var avH = this.avH = this.canvas.height / this.number;

                for (var i = 0; i < this.number; i++) {
                    for (var j = 0; j < this.number; j++) {
                        this.blocks[i] = this.blocks[i] || [];
                        var canvas = document.createElement("canvas");
                        canvas.width = avW;
                        canvas.height = avH;
                        canvas.x = j;
                        canvas.y = i;
                        canvas.map = i + "_" + j;
                        canvas.correctMap = i + "_" + j;
                        var imageData = this.context.getImageData(j * avW, i * avH, avW, avH);
                        canvas.getContext("2d").putImageData(imageData, 0, 0);
                        if (i === j && j === (this.number - 1))break;
                        // 把canvas放到二维数组blocks中;
                        this.blocks[i][j] = canvas;
                    }
                    ;
                }
                ;
                this.renderToDom();

            },
            /**
             * @param 把canvas块混排， 打乱排序;
             * */
            random: function () {

                var len = this.instances.length;
                while (len--) {
                    $(this.instances[len].canvas).remove();
                }
                ;
                //使用底线库的方法shuffle打乱排序;
                this.blocks = _.shuffle(this.blocks);
                for (var i = 0; i < this.blocks.length; i++) {
                    this.blocks[i] = _.shuffle(this.blocks[i]);
                }
                this.renderToDom();

            },
            /**
             * @desc 把canvas渲染到DOM;
             * */
            renderToDom: function () {

                document.getElementById("content").innerHTML = "";
                this.maps = {};
                this.doms = [];
                this.instances = [];
                for (var i = 0; i < this.blocks.length; i++) {
                    for (var j = 0; j < this.blocks[i].length; j++) {
                        var instance = new Block(this.blocks[i][j], j, i, this.avW, this.avH);
                        //把实例化的数据保存到instances
                        this.instances.push(instance);
                        //界面中在虚拟数据中的占位;
                        this.maps[i + "_" + j] = true;
                    }
                    ;
                }
                ;

            },

            updataDom: function (cav, obj) {

                //更新数据模型;
                this.updataMap();
                //实现拼图移动的动画;
                $(cav).animate({top: obj.y * this.avH, left: obj.x * this.avW});

            },

            updataMap: function () {

                this.maps = {};

                var len = this.instances.length;
                while (len--) {
                    this.maps[this.instances[len].canvas.y + "_" + this.instances[len].canvas.x] = true;
                    this.instances[len].canvas.map = this.instances[len].canvas.y + "_" + this.instances[len].canvas.x;
                }
                ;
                /*
                 for(var i=0; i<this.blocks.length; i++ ) {
                 for (var j = 0; j < this.blocks[i].length; j++) {
                 this.maps[this.blocks[i][j].y + "_" + this.blocks[i][j].x] = true;
                 }
                 }*/
            },

            testSuccess: function () {

                var len = this.instances.length;
                while (len--) {
                    //只要有一个不等就无法成功;
                    if (this.instances[len].canvas.correctMap !== this.instances[len].canvas.map) {
                        return;
                    }
                    ;
                }
                ;
                console.log("成功");
                if (++window.lev >= 4) {
                    alert("已经通关");
                    return;
                }
                ;
                $("#now").html(window.lev + 1);
                $(".progress-bar").width((window.lev + 1) * 25 + "%");
                init(window.lev);
            }

        });

        /**
         * @desc 对每一个canvas进行包装;
         * @param canvas
         * @param left
         * @param top
         * @param avW
         * @param avH
         * @constructor Block
         */
        var Block = function (canvas, left, top, avW, avH) {

            this.canvas = canvas;
            this.left = left;
            this.top = top;
            this.avW = avW;
            this.avH = avH;
            this.init();

        };

        $.extend(Block.prototype, {
            /**
             * @desc 对每一个canvas进行定位, 然后添加到界面中;
             * */
            init: function () {

                this.canvas.style.position = "absolute";
                this.canvas.style.left = this.avW * this.left + "px";
                this.canvas.style.top = this.avH * this.top + "px";
                this.canvas.x = this.left;
                this.canvas.y = this.top;
                document.getElementById("content").appendChild(this.canvas);

            },

            /**
             * @desc 对每一个canvas进行定位
             * */
            setPosition: function () {

                this.canvas.style.left = this.avW * this.canvas.x + "px";
                this.canvas.style.top = this.avH * this.canvas.y + "px";

            },

            /**
             * @desc 向上移动会执行的函数  ，通过判断maps下有没有对应的key值判断， 界面中的固定位置是否被占用;
             * */
            upF: function (maps, numbers, cb) {

                //如果目标有
                var temp = (this.canvas.y > 0 ? (this.canvas.y - 1) : this.canvas.y);
                var targetXY = temp + "_" + this.canvas.x;
                if (!maps[targetXY]) {
                    this.canvas.y = temp;
                    this.canvas.map = targetXY;
                    //alert("可以走")
                    cb(this.canvas, {
                        x: this.canvas.x,
                        y: this.canvas.y
                    });
                    return true;
                }
                ;

            },

            /**
             * @desc 同上
             * */
            rightF: function (maps, numbers, cb) {

                var temp = ((this.canvas.x + 1 > numbers - 1) ? this.canvas.x : this.canvas.x + 1);
                var targetXY = this.canvas.y + "_" + temp;
                if (!maps[targetXY]) {
                    this.canvas.x = temp;
                    this.canvas.map = targetXY;
                    //alert("可以走")
                    cb(this.canvas, {
                        x: this.canvas.x,
                        y: this.canvas.y
                    });
                    return true;
                }
                ;

            },

            /**
             * @desc 同上
             * */
            downF: function (maps, numbers, cb) {

                var temp = ((this.canvas.y + 1 > numbers - 1) ? this.canvas.y : this.canvas.y + 1);
                var targetXY = temp + "_" + this.canvas.x
                if (!maps[targetXY]) {
                    this.canvas.y = temp;
                    this.canvas.map = targetXY;
                    cb(this.canvas, {
                        x: this.canvas.x,
                        y: this.canvas.y
                    });
                    //alert("可以走");
                    return true;
                }
                ;

            },

            /**
             * @desc 同上
             * */
            leftF: function (maps, numbers, cb) {

                var temp = ( (this.canvas.x - 1) >= 0 ? this.canvas.x - 1 : this.canvas.x );
                var targetXY = this.canvas.y + "_" + temp;
                if (!maps[targetXY]) {
                    this.canvas.x = temp;
                    this.canvas.map = targetXY;
                    //alert("可以走")
                    cb(this.canvas, {
                        x: this.canvas.x,
                        y: this.canvas.y
                    });
                    return true;
                }
                ;

            }
        });

        /**
         * @desc 主要控制器;
         *
         * */
        function Controller(clipImage, number) {
            var run = function (clipImage, name) {
                //window.clipImage.doms ,window.clipImage.maps, numbers[level], window.clipImage.updataDom.bind(window.clipImage)
                for (var i = 0; i < clipImage.instances.length; i++) {
                    var instance = clipImage.instances[i];
                    if (instance[name].bind(instance)(clipImage.maps, number, clipImage.updataDom.bind(clipImage))) {
                        clipImage.testSuccess();
                        return
                    }
                    ;
                }
                ;
            }

            $(window).unbind("keydown");

            $(window).bind("keydown", function (ev) {
                var name;
                switch (ev.keyCode) {
                    case 37 :
                        name = "leftF";
                        break;
                    case 38 :
                        name = "upF";
                        break;
                    case 39 :
                        name = "rightF";
                        break;
                    case 40 :
                        name = "downF";
                        break;
                    default :
                        ev.preventDefault();
                        return false
                }
                ;
                run(clipImage, name);
                ev.preventDefault();
            });

            $(document).swipeLeft(function (ev) {

                run(clipImage, "leftF");
                ev.stopPropagation();

            }).swipeUp(function (ev) {

                run(clipImage, "upF");
                ev.stopPropagation();

            }).swipeRight(function (ev) {

                run(clipImage, "rightF");
                ev.stopPropagation();

            }).swipeDown(function (ev) {

                run(clipImage, "downF");
                ev.stopPropagation();

            });


        };

        function init(level) {

            util.loadImg(levels[level], function () {

                window.clipImage = new ClipImage(canvas, numbers[level]);
                window.clipImage.random();
                Controller(window.clipImage, numbers[level] || 3);

            });

        };

        $(function () {

            window.lev = 0;
            init(lev);
            bindEvents();

        });
    });