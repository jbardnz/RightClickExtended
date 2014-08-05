(function () {
    "use strict";
    
    var node_copy_paste = require('copy-paste');
    var domainManager;
    
    function load(){

    }
    
    
    function bracketPaste() {
        
        node_copy_paste.paste(function(e, content){

            domainManager.emitEvent('clipboard', 'paste', {'content':content});        
        });

    }
    
    function bracketCopy(userSelection) {
        
        node_copy_paste.copy(userSelection);
    }
    

    function init(DomainManager) {
        if (!DomainManager.hasDomain("clipboard")) {
            DomainManager.registerDomain("clipboard", {major: 0, minor: 1});
        }
        
        DomainManager.registerCommand(
            "clipboard",       // domain name
            "callPaste",    // command name
            bracketPaste,   // command handler function
            false,          // this command is synchronous
            "Pastes the contents of the users clipboard",
            [],            
            [{name: "clipboardContent", type: "string", description: "the contents of the clipboard"}]
        );
        DomainManager.registerCommand(
            "clipboard",       // domain name
            "callCopy",    // command name
            bracketCopy,   // command handler function
            false,          // this command is synchronous
            "copies current selection",
            [{name: "userSelection", type: "string", description: "users current selection"}],            
            []
        );
        DomainManager.registerCommand(
            "clipboard",       // domain name
            "load",    // command name
            load,   // command handler function
            false,          // this command is synchronous
            "Loads clipboard",
            [],             // no parameters
            []
        );
        DomainManager.registerEvent('clipboard', 'paste', {name: "content", type: "string", description: "the contents of the clipboard"});
        
        domainManager = DomainManager;
    }
    
    exports.init = init;
    
}());
