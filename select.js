var selection = {
    //元素内容选中
    'selectAllRangs' : function(node) {
        var node = $(node).get(0);
        var range, selection;
        if (window.getSelection) {   //chrome/ff等
            selection = window.getSelection();
            range = document.createRange();
            range.selectNodeContents(node);
            selection.removeAllRanges();
            selection.addRange(range);
        } else if (document.body.createTextRange) {
            range = document.body.createTextRange();
            range.moveToElementText(node);
            range.select();
        }
    },

    // 把焦点(光标)移到某个元素的前面
    'movePointForwardNode' : function(node, callback) {
        var sel, range;
        if(window.getSelection) {
            sel = window.getSelection();
            range = sel.getRangeAt(0);
            // range.selectNode(node);
            // 把range 的前后范围都设置为起点
            range.setStart( node, 0 );
            range.setEnd( node, 0 );
            sel.removeAllRanges();
            sel.addRange(range);
        } else if(document.selection) {     // IE8及以上
            sel = document.selection;
            if( sel.type != 'Control' )
            {
                range = sel.createRange();
                range.moveToElementText(node);
                // range.moveStart('character', 0);     //初始位置移动到node的开头
                // 初始位置和终点位置合在一个点
                range.collapse(true);
                range.select();
            }
        }

        callback && callback();
    }
};