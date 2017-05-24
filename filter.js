    /**
     * FilterHtml 过滤html内容，主要应用于过滤粘贴内容
     * @author ob
     * @param {array}     needRemovedTags {需要移除的标签名}
     * @param {array}     allowedTags     {允许的标签名}
     * @param {array}     needAddBrTags   {需要替换为br的块元素标签名}
     * @param {string}    html            {需要过滤的html内容}
     * @param {function}  afterFilted     {过滤完成的回调函数}
     * @param {function}  filterImg         {处理图片函数，必须有返回值，且返回值类型为string}
     */
    function FilterHtml(opts) {
        this.needRemovedTags = ['script', 'style', 'noscript', 'head', 'meta', 'title', 'pre', 'link'];
        // 当粘贴的内容里有b,span等并且插入的位置在一段文字中间时，浏览器会在粘贴的内容后面加上一个br
        this.allowedTags = ['br', 'img', 'b', 'strong'];
        this.needAddBrTags = ['p', 'li', 'dt', 'dd', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        this.html = '';
        /**
         * @param  {string} html
         */
        this.afterFilted = $.noop();
        /**
         * @param  {object} node {js(not jquery) node}
         * @return {string} html
         */
        this.filterImg = $.noop();

        $.extend(this, opts);

        this.init();
    }

    FilterHtml.prototype = {
        'init' : function() {
            if((typeof this.html != 'string') || this.html == '') return false;

            var tempNode = $('<div>' + this.html + '</div>');
            var filteredHtml = this.stripNode(tempNode.get(0));
            tempNode.remove();

            this.afterFilted && this.afterFilted(filteredHtml);
        },

        //过滤标签
        'stripNode' : function(node) {
            var html = '';
            var nodeName = node.nodeName.toLowerCase();
            if(this.needRemove(nodeName)) {
                return '';
            }

            var allowedhtml = this.getAllowedHtml(node, nodeName);
            if(allowedhtml) {
                return allowedhtml;
            }

            var children = node.childNodes;
            if(children.length) {
                for(var i=0, len=children.length; i<len; i++) {
                    var nodeName2 = children[i].nodeName.toLowerCase();
                    if(nodeName2 == '#text') {
                        html += children[i].nodeValue;
                    } else {
                        html += this.stripNode(children[i]);
                    }
                }
            } else {
                if(nodeName == '#text') {
                    html += node.nodeValue;
                }
            }

            //needAddBrTags 标签去掉并在后面加br标签
            if($.inArray(nodeName, this.needAddBrTags) != -1 && !$(node).children('br').length) {
                html += '<br>';
            }

            return html;
        },

        //判断是否应该移除该元素
        'needRemove' : function(nodeName) {
            return $.inArray(nodeName, this.needRemovedTags) != -1;
        },

        //处理允许的元素
        'getAllowedHtml' : function(node, nodeName) {
            var nodeName = nodeName ? nodeName : node.nodeName.toLowerCase();
            var html = '';
            var $node = $(node);
            if($.inArray(nodeName, this.allowedTags) != -1) {
                switch(nodeName) {
                    case 'br' :
                        html += '<br>';
                    break;
                    //处理图片
                    case 'img' : 
                        this.filterImg && (html += this.filterImg(node));
                    break;
                    //a
                    case 'a' :
                        html += '<' + nodeName +' href="' + $node.attr('href') + '">' + $node.text() + '</' + nodeName + '>';
                    break;

                    default:
                        html += '<' + nodeName +'>' + $node.text() + '</' + nodeName + '>';
                }

            }

            return html;
        }
    };

