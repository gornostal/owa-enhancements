// ==UserScript==
// @name       OWA enchancements
// @website    https://github.com/gornostal/owa-enhancements
// @match  https://mail.airbiquity.com/owa/*
// @version    1.1
// @updateURL https://raw.githubusercontent.com/gornostal/owa-enhancements/master/owa-userscript.js
// @description  Adds number of unread message to favicon; Adds Archive button to a message frame
// @copyright  2014+, AG
// @require https://code.jquery.com/jquery.min.js
// @require https://raw.githubusercontent.com/tommoor/tinycon/master/tinycon.min.js
// ==/UserScript==

/* global $:false, Tinycon:false */

onOwaReady().done(function(){
    initUnreadMessageBubble();
    addArchiveButton();
});

/**
 * Resolves deferred when OWA shows emails to a user.
 * @return {$.Deferred}
 */
function onOwaReady() {
    var owaReadyDfrd = new $.Deferred();

    setTimeout(function checkOwaReadyState (){
        if($('#spnFldrNm').length) { // id for "Inbox (x)" link
            owaReadyDfrd.resolve();
        } else {
            setTimeout(checkOwaReadyState, 300);
        }
    }, 300);

    return owaReadyDfrd;
}

/**
 * Shows bubble with number of unread messages
 * Checks only unread messages in Inbox folder
 */
function initUnreadMessageBubble() {
    // setup
    Tinycon.setOptions({
        width: 7,
        height: 10,
        font: '10px monospace',
        colour: '#000',
        background: '#fff',
        fallback: false
    });

    setInterval(function(){
        updateBubble(getUnreadMessageNumber());
    }, 5e3);

    function updateBubble(num){
        Tinycon.setBubble(Number(num));
    }

    function getUnreadMessageNumber(){
        return $('#spnCV').text().trim();
    }

}

function addArchiveButton() {

    addButtonIfItsAbsent();
    appendStyles();

    setInterval(function(){
        addButtonIfItsAbsent();
    }, 500);

    $('body').on("keypress", function(e){
        if(!e.altKey && !e.shiftKey && e.keyCode === 101) {
            // archive on E keypress
            $('.owa-archive:visible').click();
        }
    });


    function addButtonIfItsAbsent() {
        var topic = getTopicDiv();
        if (!topic.find('button').length) {
            addButton(topic).bind('click', archiveCurrentMessage);
        }
    }

    function archiveCurrentMessage() {
        var moveBtn = $('#divToolbarButtonmove'),
            archiveBtnSelector = "#divCMM #spnT:contains('Archive')";

        if(!moveBtn.length){
            return;
        }

        moveBtn.click();
        waitForSubmenu().done(function(archiveBtn){
            archiveBtn.click();
        });

        /**
         * @return {$.Deferred}
         */
        function waitForSubmenu(){
            var onSubmenu = new $.Deferred(),
                interval = 50;

            setTimeout(function checkSubmenu (){
                var archiveBtn = $(archiveBtnSelector);
                if(archiveBtn.length) {
                    onSubmenu.resolveWith(this, [archiveBtn]);
                } else {
                    setTimeout(checkSubmenu, interval);
                }
            }, interval);

            return onSubmenu;
        }
    }

    function getTopicDiv(){
        return $('#divActionIcons');
    }

    function addButton($el){
        var btn = $('<button>')
            .text('Archive')
            .attr('title', 'Move to Archive folder (E)')
            .addClass('owa-archive');
        btn.appendTo($el);
        return btn;
    }

    function appendStyles(){
        $('head').append('<style type="text/css">\
            .owa-archive {\
                color: #444;\
                background-image: -webkit-linear-gradient(top,#f5f5f5,#f1f1f1);\
                border: 1px solid rgba(0,0,0,0.1);\
                display: inline-block;\
                padding: 4px 8px;\
                border-radius: 3px;\
                font: bold 11px arial, sans-serif;\
                position: absolute;\
                top: 1px;\
                left: -100px;\
            }\
            .owa-archive:hover {\
                color: #333;\
                border: 1px solid rgba(0,0,0,0.2);\
            }\
        ');
    }
}