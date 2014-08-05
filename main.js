define(function (require, exports, module) {
    "use strict";

    var CommandManager = brackets.getModule("command/CommandManager");
    var Menus = brackets.getModule("command/Menus");
    var EditorManager = brackets.getModule("editor/EditorManager");
    var right_click_cut = "RightClickExtended.CutHandler"; 
    var right_click_copy = "RightClickExtended.CopyHandler";
    var right_click_paste = "RightClickExtended.PasteHandler";
    var NodeConnection = brackets.getModule("utils/NodeConnection");
    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
    var AppInit        = brackets.getModule("utils/AppInit");
    var nodeConnection = new NodeConnection();
    
    function chain() {
        var functions = Array.prototype.slice.call(arguments, 0);
        if (functions.length > 0) {
            var firstFunction = functions.shift();
            var firstPromise = firstFunction.call();
            firstPromise.done(function () {
                chain.apply(null, functions);
            });
        }
    }
    
    
    AppInit.appReady(function () {

        
        function connect() {
            var connectionPromise = nodeConnection.connect(true);
            connectionPromise.fail(function () {
                console.error("[brackets-simple-node] failed to connect to node");
            });
            return connectionPromise;
        }
    
        
        function loadClipboard() {
            var path = ExtensionUtils.getModulePath(module, "node/clipboard");
            var loadPromise = nodeConnection.loadDomains([path], true);
            loadPromise.fail(function (e) {
                console.log(e);
                console.log("[brackets-simple-node] failed to load clipboard");
            });
            return loadPromise;
        }
        
        
        function clipboardLoad() {
            var loadPromise = nodeConnection.domains.clipboard.load();
            loadPromise.fail(function (err) {
                console.error("[brackets-simple-node] failed to run clipboard.load", err);
            });
            loadPromise.done(function (err) {
                //loaded

            });
            return loadPromise;
        }
        
        chain(connect, loadClipboard, clipboardLoad);
    });
                     
       
    
    $(nodeConnection).on("clipboard.paste", function (e, clipboardContent) {
        var thisEditor = EditorManager.getCurrentFullEditor();
        var cp = thisEditor._codeMirror.getCursor();
        thisEditor._codeMirror.replaceSelection(clipboardContent.content);

        //move cursor to end of pasted content
        cp.ch += clipboardContent.content.length;
        thisEditor._codeMirror.setCursor(cp);
    });
    
    
    //Function to run when the menu item is clicked
    function handleRightClickPaste() {
        
        //Paste text
        nodeConnection.domains.clipboard.callPaste();
    }
    
    function handleRightClickCopy() {
        
        var thisEditor = EditorManager.getCurrentFullEditor();
        
        //check selection is not blank
        if(thisEditor._codeMirror.getSelection().trim() != ''){
            nodeConnection.domains.clipboard.callCopy(thisEditor._codeMirror.getSelection());
        }
        
    }
    
    function handleRightClickCut() {
        
        var thisEditor = EditorManager.getCurrentFullEditor();
        var cp = thisEditor._codeMirror.getCursor();
        nodeConnection.domains.clipboard.callCopy(thisEditor._codeMirror.getSelection());
        
        thisEditor._codeMirror.replaceSelection('');
        thisEditor._codeMirror.setCursor(cp);
    }
    
    
    CommandManager.register("Cut", right_click_cut, handleRightClickCut);
    CommandManager.register("Copy", right_click_copy, handleRightClickCopy);
    CommandManager.register("Paste", right_click_paste, handleRightClickPaste);
    
    Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuDivider();
    Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuItem(right_click_cut);
    Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuItem(right_click_copy);
    Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuItem(right_click_paste);
   
    
    
    //exports.handleRightClickExtended = handleRightClickExtended;
});