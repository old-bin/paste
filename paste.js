    /**
     * Paste 对粘贴进编辑器里的内容进行处理
     * @author ob
     */
    
    function Paste(opts) {
        // paste事件的event对象，必须要传的元素，内容要从这里取
        this.e = null;
        //回调函数
        // this.dealHtml = $.noop();
        this.pasteContent = '';
        $.extend(this, opts);

        this.paste();
    }

    Paste.prototype = {
        'paste' : function() {
            if(!this.e) {
                throw new Error('The paste event arguments e must have!');
            }

            //chrome/firefox/safari
            var clipboardData = (this.e.originalEvent || this.e).clipboardData;
            var pasteHtml = '';
            if(clipboardData && clipboardData.getData) {
                pasteHtml = this.dealPasteHtml(clipboardData);
            } else {
                //IE 只留纯文本，
                this.dealPasteText();
                pasteHtml = 1;
            }

            if(pasteHtml) return true;

            this.dealSinglePasteImg(clipboardData);
        },

        'dealPasteHtml' : function(clipboardData) {
            var pasteHtml = '';
            var types = clipboardData.types;
            //DOMStringList 这个是firefox; chrome 的types 是个array
            if (((types instanceof DOMStringList) && types.contains("text/html")) || (types.indexOf && types.indexOf('text/html') !== -1)) {
                pasteHtml = $.trim(clipboardData.getData('text/html'));
                if(pasteHtml) {
                    //处理html内容
                    // is(this.dealHtml, 'function') && this.dealHtml(pasteHtml);
                    this.pasteContent = pasteHtml;
                }
                return pasteHtml;
            } else if(types.indexOf && types.indexOf('text/plain') !== -1) {   //safari/chrome 并不总会是'text/html'
                this.pasteContent = this.replaceTextToHtml($.trim(clipboardData.getData('text/plain')));
                return this.pasteContent;
            } else {
                // do nothing
            }

            return '';
        },

        //IE等不支持text/html的
        'dealPasteText' : function() {
            var clipboardData = window.clipboardData;
            if(clipboardData && clipboardData.getData) {
                this.pasteContent = this.replaceTextToHtml(clipboardData.getData('Text'));
                // is(this.dealHtml, 'function') && this.dealHtml(pasteHtml);
            }
        },

        //截图/直接复制图片 粘贴处理
        //safari 截图粘贴过来的是.image.tiff 格式的图片,不做处理
        'dealSinglePasteImg' : function(clipboardData) {
            if(clipboardData.items && clipboardData.items.length) {
                $.each(clipboardData.items, $.proxy(function(i, item) {
                    if(/image/.test(item.type)) {
                        this.getImgReader(item.getAsFile(), $.proxy(function(img) {
                            this.pasteContent = '<img src="' +img+ '">';
                        }, this));
                    }
                }, this));
            }
        },

        //从blob 对象里提取图片
        'getImgReader' : function(blob, callback) {
            var reader = new FileReader();
            reader.onload = function(event) {
                callback && callback(event.target.result);
            }
            reader.readAsDataURL(blob);
        },

        // /s === [ \f\n\r\t\v\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]
        // 所以先处理换行，再处理空格
        'replaceTextToHtml' : function(text) {
            text = text.replace(/\n/g, '<br>');

            return text.replace(/[\s\t]/g, function($0, $1) {
                if($0 == ' ') {
                    return '&nbsp;'
                } else if($0 == '\t') {
                    return '&nbsp;&nbsp;&nbsp;&nbsp;';
                }
                    
                return '';
            });
        },

        'getPasteContent' : function() {
            return this.pasteContent;
        }
    };

    function is(obj, type) {
        var type = type.substr(0, 1).toUpperCase() + type.substr(1);
        return {}.toString.call(obj) == '[object '+ type +']';
    }

    function getPasteContent(e) {
        var p = new Paste({
            e: e
        });
        return p.getPasteContent();
    }
