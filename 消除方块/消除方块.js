/**
 * Created by ZHY on 2017/5/23.
 */
$("#tab2").hide();
var colorArray = new Array('#5bc0de', 'white', '#a7c158', 'black', '#d83333'); //颜色数组
var x = 7; //x轴行数
var y = 10; //y轴行数
var totalArray = new Array(); //方块总数
var sameArray = new Array(); //消灭方块数组
var contentTab = document.getElementById('contentTab'); //存放方块的盒子
var isShow = false;
var timer = null;
var currentLevel = 1; //当前关卡
var currentLevelScore = 0; //当前关卡得分
var targetScore = getTargetScore(); //目标分数
var totalScore = 0; //总分
//最高分
var bestScore = getCookie('starBestScore');
if (bestScore != null && bestScore != "") {
    bestScore = Number(bestScore);
} else {
    bestScore = 0;
}


$("#0").spectrum({
    color: colorArray[0]
});
$("#1").spectrum({
    color: colorArray[1]
});
$("#2").spectrum({
    color: colorArray[2]
});
$("#3").spectrum({
    color: colorArray[3]
});
$("#4").spectrum({
    color: colorArray[4]
});


function selectColor() {
    colorArray[0] = $("#00 .sp-preview-inner").css('background-color')
    colorArray[1] = $("#01 .sp-replacer .sp-preview-inner").css('background-color')
    colorArray[2] = $("#02 .sp-replacer .sp-preview-inner").css('background-color')
    colorArray[3] = $("#03 .sp-replacer .sp-preview-inner").css('background-color')
    colorArray[4] = $("#04 .sp-replacer .sp-preview-inner").css('background-color')
    console.log(colorArray);
    $("#tab2").show();
    $("#tab1").hide();
    starScore(); //初始化分数
    starStar(); //初始化方块数组
    starTable(); //初始化方块页面
}

//获取目标分数
function getTargetScore() {
    return 1000 * (1 + currentLevel) * currentLevel / 2;
}

//获取每次消除分数
function getScore(length) {
    return length * length * 5;
}

//获取最后奖励分数
function getRewardsScore(deadCount) {
    if (deadCount < 10) {
        return (10 - deadCount) * 100;
    } else {
        return 0;
    }
}

//设置提示消息
function setShowMessage(msg) {
    if (document.getElementById('showMessage').innerHTML != '' && timer != null) {
        delShowMessage();
    }
    document.getElementById('showMessage').innerHTML = msg; //设置提示消息
    timer = setInterval("delShowMessage()", 3000);
}

//消除提示消息
function delShowMessage() {
    document.getElementById('showMessage').innerHTML = '';
    clearInterval(timer);
}

//提示消息
function showMessage(length) {
    var msg = '';
    switch (length) {
        case 5:
            msg = '你真棒!';
            break;
        case 6:
            msg = '赞!';
        case 7:
            msg = '厉害了!';
            break;
        case 8:
            msg = '赞!';
            break;
        default:
            msg = length + '连消' + getScore(length) + '分!';
    }
    setShowMessage(msg);
}

//设置Cookie
function setCookie(c_name, value, expiredays) {
    var exp = new Date();
    exp.setTime(exp.getTime() + expiredays * 24 * 60 * 60 * 1000);
    document.cookie = c_name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}

//获取Cookie
function getCookie(c_name) {
    var arr, reg = new RegExp("(^| )" + c_name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg)) {
        return unescape(arr[2]);
    } else {
        return "";
    }
}

//初始化分数
function starScore() {
    document.getElementById('bestScore').innerHTML = bestScore;
    document.getElementById('currentLevelScore').innerHTML = currentLevelScore;
    document.getElementById('currentLevel').innerHTML = currentLevel;
    document.getElementById('targetScore').innerHTML = targetScore;
    document.getElementById('totalScore').innerHTML = totalScore;
}

//初始化方块数组
function starStar() {
    for (var i = x - 1; i >= 0; i--) {
        totalArray[i] = new Array();
        for (var j = 0; j < y; j++) {
            var color = getRound(); //获取随机颜色
            totalArray[i][j] = new Array();
            totalArray[i][j]['color'] = color;
            totalArray[i][j]['col'] = i;
            totalArray[i][j]['row'] = j;
        }
    }
}

//初始化方块页面
function starTable() {
    contentTab.innerHTML = '';
    for (var i = x - 1; i >= 0; i--) {
        var td = '';
        for (var j = 0; j < y; j++) {
            td += '<td style=\'background:' + totalArray[i][j]['color'] + ' no-repeat;\' onclick=\'onTouchesBegan(' + i + ',' + j + ')\' id=\'star' + i + '' + j + '\'></td>';
        }
        contentTab.innerHTML += '<tr class=\'tr' + i + '\'>' + td + '</tr>';
    }
}

//获取随机颜色
function getRound() {
    var num = Math.round(Math.random() * (colorArray.length - 1));
    return colorArray[num];
}

//检查数组包含元素
Array.prototype.contains = function (item) {
    for (i = 0; i < this.length; i++) {
        if (this[i]['col'] == item['col'] && this[i]['row'] == item['row']) {
            return true;
        }
    }
    return false;
};

//触发点击事件
function onTouchesBegan(col, row) {
    checkSameColorStars(totalArray[col][row]); //检测方块相同颜色区域
    removeSameColorStars(); //移除相同的方块
}
function onHover(col, row) {
    checkSameColorStars(totalArray[col][row]); //检测方块相同颜色区域
    //相同颜色的方块是否大于1
    var length = sameArray.length;
    if (length > 1) {
        for (var k = 0; k < length; k++) {
            var simpleStar = sameArray[k];
            if (simpleStar) {
                var col = simpleStar['col'];
                var row = simpleStar['row'];
                totalArray[col].splice(row, 1, null);
                document.getElementById('star' + col + '' + row).style.opacity = '0.7';
            }
        }
    }
}
function onMouseDown(col, row) {
    checkSameColorStars(totalArray[col][row]); //检测方块相同颜色区域
    //相同颜色的方块是否大于1
    var length = sameArray.length;
    if (length > 1) {
        for (var k = 0; k < length; k++) {
            var simpleStar = sameArray[k];
            if (simpleStar) {
                var col = simpleStar['col'];
                var row = simpleStar['row'];
                totalArray[col].splice(row, 1, null);
                document.getElementById('star' + col + '' + row).style.opacity = '1';
            }
        }
    }
}

//检测一方块的四个方向
function checkOneStarFourSide(sprite) {
    if (sprite == null) {
        retrun;
    }
    var col = sprite['col'];
    var row = sprite['row'];
    var color = sprite['color'];
    var fourSideArray = new Array(); //四个方向的方块总数
//向上消除
    if (col < x - 1) {
        var upSprite = totalArray[col + 1][row];
        if (upSprite != null && upSprite['color'] == color) {
            fourSideArray.push(upSprite);
        }
    }
//向右消除
    if (row < y - 1) {
        var upSprite = totalArray[col][row + 1];
        if (upSprite != null && upSprite['color'] == color) {
            fourSideArray.push(upSprite);
        }
    }
//向下消除
    if (col > 0) {
        var upSprite = totalArray[col - 1][row];
        if (upSprite != null && upSprite['color'] == color) {
            fourSideArray.push(upSprite);
        }
    }
//向左消除
    if (row > 0) {
        var upSprite = totalArray[col][row - 1];
        if (upSprite != null && upSprite['color'] == color) {
            fourSideArray.push(upSprite);
        }
    }
    return fourSideArray;
}

//检测方块相同颜色区域
function checkSameColorStars(sprite) {
    if (sprite == null) {
        retrun;
    }
    var newSameArray = new Array(); //每次扩展新加入的方块总数
    sameArray.push(sprite);
    newSameArray.push(sprite);
    while (newSameArray.length > 0) {
        for (var i = 0; i < newSameArray.length; i++) {
            var fourSide = checkOneStarFourSide(newSameArray[i]); //检测点击方块四周是否有相同的颜色的方块
            if (fourSide.length > 0) {
                for (var j = 0; j < fourSide.length; j++) {
                    if (!sameArray.contains(fourSide[j])) {
                        sameArray.push(fourSide[j]);
                        newSameArray.push(fourSide[j]);
                    }
                }
            }
            newSameArray.splice(i, 1);
        }
    }
}

//移除相同的方块
function removeSameColorStars() {
//相同颜色的方块是否大于1
    var length = sameArray.length;
    if (length > 1) {
        for (var k = 0; k < length; k++) {
            var simpleStar = sameArray[k];
            if (simpleStar) {
                var col = simpleStar['col'];
                var row = simpleStar['row'];
                totalArray[col].splice(row, 1, null);
                document.getElementById('star' + col + '' + row).style.background = 'none';
            }
        }
        showMessage(length); //提示消息
        var score = getScore(length); //每次消灭的总数
        currentLevelScore = currentLevelScore + score; //当前关卡得分
        totalScore = totalScore + score; //总分
//总分大于目标分 过关
        if (totalScore > targetScore && !isShow) {
            isShow = true;
            setShowMessage('恭喜过关!');
        }
        document.getElementById('currentLevelScore').innerHTML = currentLevelScore; //设置当前关卡得分
        document.getElementById('totalScore').innerHTML = totalScore; //设置总分
    }
    sameArray = [];
    fallStar(); //方块掉落
}

//转换数组 获取第j列的数组
function getLtotalArray(j) {
    var LtotalArray = new Array();
    for (var i = 0; i < x; i++) {
        LtotalArray[i] = new Array();
        if (totalArray[i][j] == null) {
            LtotalArray.splice(i, 1, null);
        } else {
            LtotalArray[i]['color'] = totalArray[i][j]['color'];
            LtotalArray[i]['col'] = totalArray[i][j]['col'];
            LtotalArray[i]['row'] = totalArray[i][j]['row'];
        }
    }
    return LtotalArray;
}

//方块掉落 填充空缺
function fallStar() {
    for (var j = 0; j < y; j++) {
//循环得到每一列的数组
        var sprites = getLtotalArray(j);
        var length = sprites.length;
        for (var i = 0; i < length; i++) {
            var pSprite0 = sprites[i];
//找到空方块
            if (pSprite0 == null) {
                var k = i + 1;
                while (k < length) {
                    var upSprite = sprites[k];
                    if (upSprite != null) {
                        upSprite['col'] = i;
                        upSprite['row'] = j;
                        totalArray[i].splice(j, 1, upSprite);
                        totalArray[k].splice(j, 1, null);
                        sprites.splice(i, 1, upSprite);
                        sprites.splice(k, 1, null);
                        document.getElementById('star' + i + '' + j).style.cssText = 'background:' + upSprite['color'] + ' no-repeat;';
                        document.getElementById('star' + k + '' + j).style.background = 'none';
                        k = length;
                    }
                    k++;
                }
            }
        }
    }
    combineStar(); //向左合并方块
    deadStar(); //检测死局
}

//向左合并方块
function combineStar() {
    for (var j = 0; j < y; j++) {
//循环得到每一列的数组
        var sprites = getLtotalArray(j);
        var mSprite0 = sprites[0];
//如果底部有空方块就向左合并
        if (mSprite0 == null) {
            if (j < y - 1) {
                var k = j + 1;
                while (k < y) {
                    var upSprite = getLtotalArray(k);
                    var pSprite0 = upSprite[0];
                    if (pSprite0 != null) {
                        for (var i = 0; i < upSprite.length; i++) {
                            if (upSprite[i] != null) {
                                upSprite[i]['col'] = i;
                                upSprite[i]['row'] = j;
                                totalArray[i].splice(j, 1, upSprite[i]);
                                totalArray[i].splice(k, 1, null);
                                document.getElementById('star' + i + '' + j).style.cssText = 'background:' + upSprite[i]['color'] + ' no-repeat;';
                                document.getElementById('star' + i + '' + k).style.background = 'none';
                            }
                        }
                        k = y;
                    }
                    k++;
                }
            }
        }
    }
}

//检测死局
function deadStar() {
    var isDead = true;
    var deadCount = 0; //剩余的方块个数
    for (var j = 0; j < y; j++) {
        var sprites = getLtotalArray(j);
        var length = sprites.length;
        for (var i = 0; i < length; i++) {
            var pSprite0 = sprites[i];
            if (pSprite0 != null) {
                var fourSide = checkOneStarFourSide(pSprite0);
//还有可消灭的方块
                if (fourSide.length > 0) {
                    isDead = false;
                    return;
                }
            }
        }
    }
//没有可消灭的方块
    if (isDead) {
        for (var j = 0; j < y; j++) {
            var sprites = getLtotalArray(j);
            var length = sprites.length;
            for (var i = 0; i < length; i++) {
                var pSprite0 = sprites[i];
                if (pSprite0 != null) {
                    deadCount++;
                }
            }
        }
        var score = getRewardsScore(deadCount); //获取最后奖励分数
        if (score > 0) {
            currentLevelScore = currentLevelScore + score; //当前关卡得分
            totalScore = totalScore + score; //总分
            document.getElementById('currentLevelScore').innerHTML = currentLevelScore; //设置当前关卡得分
            document.getElementById('totalScore').innerHTML = totalScore; //设置总分
        }
//剩余方块大于0
        if (deadCount > 0) {
//总分大于目标分 过关
            if (totalScore > targetScore) {
                currentLevel++; //关卡加1
                targetScore = getTargetScore(); //获取当前关卡目标分
                currentLevelScore = 0; //当前得分清空
                setShowMessage('剩余' + deadCount + '个方块,奖励' + score + '分!');
            } else {
//游戏结束
                currentLevel = 1; //关卡清空
                targetScore = getTargetScore(); //获取当前关卡目标分
                currentLevelScore = 0; //当前得分清空
//总分大于历史最高分
                if (totalScore > bestScore) {
                    bestScore = totalScore; //保存最高分
                    setCookie('starBestScore', bestScore, 30);
                }
                totalScore = 0; //总分清空
                setShowMessage('游戏结束!');
            }
        } else {
//总分小于目标分
            if (totalScore < targetScore) {
                var score = targetScore - totalScore; //获取最后奖励分数
                currentLevelScore = currentLevelScore + score; //当前关卡得分
                totalScore = totalScore + score; //总分
                document.getElementById('currentLevelScore').innerHTML = currentLevelScore; //设置当前关卡得分
                document.getElementById('totalScore').innerHTML = totalScore; //设置总分
            }
            currentLevel++; //关卡加1
            targetScore = getTargetScore(); //获取当前关卡目标分
            currentLevelScore = 0; //当前得分清空
        }
        isShow = false;
        starScore(); //初始化分数
        starStar(); //初始化方块数组
        starTable(); //初始化方块页面
    }
}
