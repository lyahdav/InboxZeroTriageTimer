// ==UserScript==
// @name         Workplace test
// @namespace    https://fb.workplace.com/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://fb.workplace.com/*
// @match        https://2v15oj744j.codesandbox.io/
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_addValueChangeListener
// @grant unsafeWindow
// ==/UserScript==

const TRANSMISSION_KEY = "Number of unread Workplace notifications";

const MARK_AS_UNREAD_SELECTOR = 'div[aria-label="Mark as Read"]';

(function() {
    'use strict';

    var xmssionCount = 0;
    var elementsWithListener = [];

    function listenForNewUnreadNotifications() {
        // Select the node that will be observed for mutations
        var targetNode = document.body; // TODO get more specific? maybe all elements matching selector "ul.uiList._4kg"?

        // Options for the observer (which mutations to observe)
        var config = { childList: true, subtree: true };

        // Callback function to execute when mutations are observed
        var callback = function(mutationsList, observer) {
            for(var mutation of mutationsList) {
                if (mutation.type == 'childList') {
                    mutation.addedNodes.forEach((el) => {
                        el.querySelectorAll('._23dk').forEach((innerEl) => {
                            console.log(`[Inner] A notification node has been added`, innerEl.innerText);
                        });

                        if (el.className && el.className.contains('_23dk')) {
                            console.log('qs', el.querySelector(MARK_AS_UNREAD_SELECTOR));
                            console.log(`A notification node has been added`, el.innerText);
                        }
                    });
                }
            }
        };

        // Create an observer instance linked to the callback function
        var observer = new MutationObserver(callback);

        // Start observing the target node for configured mutations
        observer.observe(targetNode, config);

        // Later, you can stop observing
        //observer.disconnect();
    }

    function clickHandler(e) {
        xmssionCount++;
        console.log(`clicked notification, ${xmssionCount}`);
        GM_setValue(TRANSMISSION_KEY, xmssionCount);
    }

    const onInterval = () => {
        // wrong because when we're selected on one it's unread but it still needs to be triaged
        //const numberOfUnreadNotifications = document.querySelectorAll(MARK_AS_UNREAD_SELECTOR).length;

        var lists = document.querySelectorAll('ul.uiList._4kg');
        const numberOfUnreadNotifications = (lists && lists.length > 0) ? lists[lists.length-1].querySelectorAll('li._23dk').length : 0;

        console.log('numberOfUnreadNotifications', numberOfUnreadNotifications);

        GM_setValue(TRANSMISSION_KEY, numberOfUnreadNotifications);
        /*
        elementsWithListener.forEach((el) => {
            el.removeEventListener("click", clickHandler);
        });
        elementsWithListener = [];
        document.querySelectorAll('._23dk').forEach((element)=>{
            if (element.querySelector(MARK_AS_UNREAD_SELECTOR) != null) {
                console.log("adding event listener");
                element.addEventListener("click", clickHandler);
                elementsWithListener.push(element);
            }
        });
        */
    };

    if (location.hostname === "fb.workplace.com") {
        //listenForNewUnreadNotifications(); // TODO can get this working? would be less hacky
        setInterval(onInterval, 1000);
    } else {
        console.log('calling GM_addValueChangeListener');
        GM_addValueChangeListener(
            TRANSMISSION_KEY, (keyName, oldValue, newValue, bRmtTrggrd) => {
                console.log(`Received event, newValue: ${newValue}, oldValue: ${oldValue}`);
                unsafeWindow.triggerNextButton();
            });
    }
})();