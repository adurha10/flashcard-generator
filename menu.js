const Inquirer = require("inquirer");
const CardConstructor = require("./CardConstructors.js");
const fs = require("fs");
var practiceArr = [];


function initialMenu(){
    Inquirer.prompt([
        {
            type: "list",
            name: "activity",
            message: "What would you like to do?",
            choices: ["Create new cards", "Delete old cards", "Organize packs", "Practice with current cards", "Quit"]
        }
    ]).then(function(inqResp){
        var activity = inqResp.activity;

        if (activity === "Create new cards"){
            createMenu();
        } else if (activity === "Delete old cards"){
            deleteMenu();
        } else if (activity === "Organize packs"){
            packsMenu();
        } else if (activity === "Practice with current cards"){
            practiceMenu();
        } else if (activity === "Quit"){
        }
    });
}

function createMenu(){
    Inquirer.prompt([
        {
            type: "list",
            name: "cardType",
            message: "Would you like to create flash cards or cloze cards?",
            choices: ["Flash Cards", "Cloze Cards", "Return to main menu"]
        }
    ]).then(function(inqResp){
        var cardType = inqResp.cardType;

        if (cardType === "Flash Cards"){
            createFlash();
        } else if (cardType === "Cloze Cards"){
            createCloze();
        } else if (cardType === "Return to main menu"){
            initialMenu();
        }
    });
}

function deleteMenu(){
    Inquirer.prompt([
        {
            type: "list",
            name: "deleteChoice",
            message: "Would you like to delete individual cards or full packs",
            choices: ["Packs", "Individual Cards", "Main Menu"]
        }
    ]).then(function(inqResp){
        var deleteChoice = inqResp.deleteChoice;

        if (deleteChoice === "Main Menu"){
            initialMenu();
        } else if (deleteChoice === "Packs"){
            deletePacks();
        } else if (deleteChoice === "Individual Cards"){
            deleteCards();
        }
    });
}

function packsMenu(){
    Inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do with the card packs?",
            choices: ["Create new packs", "Delete current packs",  "Add cards to a pack", "Remove cards from a pack"],
            name: "packActivity"
        }
    ]).then(function(inqResp){
        if (inqResp.packActivity === "Create new packs"){
            createPacks();
        } else if (inqResp.packActivity === "Delete current packs"){
            deletePacks();
        } else if (inqResp.packActivity === "Add cards to a pack"){
            addToPacks();
        } else if (inqResp.packActivity === "Remove cards from a pack"){
            removeFromPacks();
        }
    });

}

function practiceMenu(){
    practiceArr = [];
    Inquirer.prompt([
        {
            type: "list",
            message: "Select the pack you want to use, or select 'All Cards'",
            name: "practicePack",
            choices: function(){
                var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
                var choices = cards.packs;
                choices.push("All Cards");
                choices.push("Main Menu");
                return choices;
            }
        }
    ]).then(function(inqResp){
        var practicePack = inqResp.practicePack;
        if (practicePack === "Main Menu"){
            initialMenu();
        }
        var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
        if (practicePack === "All Cards"){
            cards.cards.flash.forEach(function(flashCard){
                practiceArr.push(flashCard);
            });
            cards.cards.cloze.forEach(function(clozeCard){
                practiceArr.push(clozeCard);
            });
        } else {
            cards.cards.flash.forEach(function(flashCard){
                if (flashCard.packs.includes(practicePack)){
                    practiceArr.push(flashCard);
                }
            });
            cards.cards.cloze.forEach(function(clozeCard){
                if (clozeCard.packs.includes(practicePack)){
                    practiceArr.push(clozeCard);
                }
            });
        }  
        quiz();
    });
}

function createFlash(){
    var front;
    var back;
    var packs;

    Inquirer.prompt([
        {
            type: "input",
            name: "front",
            message: "Enter the question or definition - Front of the card"
        },
        {
            type: "input",
            name: "back",
            message: "Enter the answer to your question - The back of the card"
        },
        {
            type: "checkbox",
            name: "packs",
            message: "Which packs would you like to add this card to?",
            choices: function(){
                if (JSON.parse(fs.readFileSync("cards.json", "utf8"))){
                    var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
                    var choices = cards.packs;
                    choices.push("None");
                } else {
                    choices = ["None"];
                }
                return choices;
            }
        }
    ]).then(function(inqResp){
        var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
        if (inqResp.packs.includes("None")){
            packs = [];
        } else {
            packs = inqResp.packs;
        }
        front = inqResp.front;
        back = inqResp.back;
        CardConstructor.BasicCard(front, back, packs);
        Inquirer.prompt([
            {
                type: "confirm",
                message: "Would you like to make more flash cards?",
                name: "moreFlash"
            }
        ]).then(function(inqResp){
            if (inqResp.moreFlash){
                createFlash();
            } else {
                initialMenu();
            }
        });
    });
}

function createCloze(){
    var text;
    var deletion;
    var packs;

    Inquirer.prompt([
        {
            type: "input",
            message: "Please enter the full text of the card. You don't need to create the blank space yet!",
            name: "fullText"
        }
    ]).then(function(inqResp){
        text = inqResp.fullText
        var textArr = inqResp.fullText.split(" ");
        Inquirer.prompt([
            {
                type: "checkbox",
                message: "Select all the words you want to delete. Don't select them all!",
                name: "deleteSelection",
                choices: textArr
            },
            {
            type: "checkbox",
            name: "packs",
            message: "Which packs would you like to add this card to?",
            choices: function(){
                var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
                var choices = cards.packs;
                 choices.push("None")
                return choices;
            }
        }
        ]).then(function(inqResp){
            var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
            deletion = inqResp.deleteSelection;
            if (inqResp.packs.includes("None")){
                packs = [];
            } else {
                packs = inqResp.packs;
            }
            CardConstructor.ClozeCard(text, deletion, packs);
            Inquirer.prompt([
                {
                    type: "confirm",
                    message: "Would you like to make more cloze cards?",
                    name: "moreCloze"
                }
            ]).then(function(inqResp){
                if (inqResp.moreCloze){
                    createCloze();
                } else {
                    initialMenu();
                }
            });
        });
    });
}

function createPacks(){
     Inquirer.prompt([
                {
                    type: "input",
                    message: "Enter the name of your new pack",
                    name: "newPack"
                },
                {
                    type: "confirm",
                    message: "Would you like to add any other packs?",
                    name: "morePacks"
                }
            ]).then(function(inqResp){
                var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
                cards.packs.push(inqResp.newPack);
                fs.writeFileSync("cards.json", JSON.stringify(cards), "utf8");  
                if (inqResp.morePacks){
                    createPacks();
                } else {
                    addToPacks();
                }
            });
}

function deletePacks(){
     Inquirer.prompt([
        {
            type: "list",
            name: "packsToDelete",
            message: "Which packs would you like to remove?",
            choices: function (){
                var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
                var choices = cards.packs;
                return choices;
            }
        },
        {
            type: "confirm",
            message: "Would you like to delete all associated cards as well?",
            name: "confirmDeleteCards"
        }
    ]).then(function(inqResp){
        var packsToDelete = inqResp.packsToDelete;
        var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
        var flash = cards.cards.flash;
        var cloze = cards.cards.cloze;

        if (inqResp.confirmDeleteCards){
            for (var i = flash.length; i >= 0; i--) {
                var element = flash[i];
                element.packs.forEach(function(packElement) {
                    if (packsToDelete.indexOf(packElement) !== -1){
                        flash.slice(flash[i] , 1);
                    }
                });
            }
            for (var i = cloze.length; i >= 0; i--) {
                var element = cloze[i];
                element.packs.forEach(function(packElement) {
                    if (packsToDelete.indexOf(packElement) !== -1){
                        cloze.slice(cloze[i] , 1);
                    }
                });
            }
        } else { 
            for (var i = flash.length; i >= 0; i--) {
                var element = flash[i];
                element.packs.forEach(function(packElement) {
                    if (packsToDelete.indexOf(packElement) !== -1){
                        element.packs.slice(element.packs.indexOf(packElement) , 1);
                    }
                });
            }
            for (var i = cloze.length; i >= 0; i--) {
                var element = cloze[i];
                element.packs.forEach(function(packElement) {
                    if (packsToDelete.indexOf(packElement) !== -1){
                        cloze.slice(cloze[i] , 1);
                    }
                });
            }    
        }
        fs.writeFileSync("cards.json", JSON.stringify(cards), "utf8");
    });
}

function addToPacks(){
    Inquirer.prompt([
        {
            type: "list",
            message: "Which pack would you like to add to?",
            name: "packForAdding",
            choices: function(){
                var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
                var choices = cards.packs;
                choices.push("Main Menu")
                return choices;
            }
        }
    ]).then(function(inqResp){
        var packForAdding = inqResp.packForAdding;
        if (inqResp.packForAdding === "Main Menu") {
            initialMenu();
        }
        Inquirer.prompt([
            {
                type: "checkbox",
                message: `Please select all cards you would like to add to the pack ${packForAdding}`,
                name: "cardsAdded",
                choices: function(){
                    var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
                    var choices = [];
                    cards.cards.cloze.forEach(function(element){
                        choices.push(element.text);
                    });
                    cards.cards.flash.forEach(function(element){
                        choices.push(element.front);
                    });
                    return choices;
                }
            }
        ]).then(function(inqResp){
            var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));            
            inqResp.cardsAdded.forEach(function (addedCard){
                cards.cards.flash.forEach(function(flashCard){
                    if (flashCard.front === addedCard){
                        console.log(`If hit ${flashCard}  ${flashCard.front}  ${addedCard}`);
                        flashCard.packs.push(packForAdding);
                    }
                });
                cards.cards.cloze.forEach(function(clozeCard){
                    if (clozeCard.front === addedCard){
                        clozeCard.packs.push(packForAdding);
                    }
                });
            });
            fs.writeFile("cards.json", JSON.stringify(cards), "utf8");
            Inquirer.prompt([
                {
                    type: "confirm",
                    message: "Would you like to add to another pack?",
                    name: "addToMore"
                }
            ]).then(function(inqResp){
                if (inqResp.addToMore) {
                    addToPacks();
                } else {
                    initialMenu();
                }
            });

        });
    });
}

function removeFromPacks(){
    Inquirer.prompt([
        {
            type: "list",
            message: "Which pack would you like to remove from?",
            name: "packForDeleting",
            choices: function (){
                var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
                var choices = cards.packs;
                choices.push("Main Menu");
                return choices;
            }
        }
    ]).then(function(inqResp){
        var packForDeleting = inqResp.packForDeleting;
        if (packForDeleting === "Main Menu") {
            initialMenu();
        }
        Inquirer.prompt([
            {
                type: "checkbox",
                message: `Please select all cards you would like to delete from the pack ${packForDeleting}`,
                name: "cardsDeleted",
                choices: function(){
                    var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
                    var choices = [];
                    cards.cards.cloze.forEach(function(element){
                        if(element.packs.includes(packForDeleting)){
                            choices.push(element.text);
                        }
                    });
                    cards.cards.flash.forEach(function(element){
                        if(element.packs.includes(packForDeleting)){
                            choices.push(element.front);
                        }
                    });
                    return choices;
                }
            }
        ]).then(function(inqResp){
            var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
            inqResp.cardsDeleted.forEach(function (deletedCard){
                cards.cards.flash.forEach(function(flashCard){
                    if (flashCard.front === deletedCard){
                        flashCard.packs.splice(flashCard.packs.indexOf(packForDeleting),1);
                    }
                });
                cards.cards.cloze.forEach(function(clozeCard){
                    if (clozeCard.front === deletedCard){
                        clozeCard.packs.splice(clozeCard.packs.indexOf(packForDeleting),1);
                    }
                });
            });
            fs.writeFile("cards.json", JSON.stringify(cards), "utf8");
            Inquirer.prompt([
                {
                    type: "confirm",
                    message: "Would you like to delete from another pack?",
                    name: "removeFromMore"
                }
            ]).then(function(inqResp){
                if (inqResp.removeFromMore) {
                    removeFromPacks();
                } else {
                    initialMenu();
                }
            });

        });
    });

}

function deleteCards(){
    Inquirer.prompt([
        {
            type: "checkbox",
            name: "deletedCards",
            message: "Check all the cards you would like to delete",
            choices: function(){
                var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
                var choices = [];
                cards.cards.cloze.forEach(function(element){
                    choices.push(element.text);
                });
                cards.cards.flash.forEach(function(element){
                    choices.push(element.front);
                });
                return choices;
            }
        }
    ]).then(function(inqResp){
        var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
        inqResp.deletedCards.forEach(function(selectionElement){
            cards.cards.flash.forEach(function(flashElement){
                if (selectionElement === flashElement.front){
                    console.log(
                    `First If statement
                    Flash Element: ${flashElement.front}
                    Selection Element: ${selectionElement}`);
                    cards.cards.flash.splice(cards.cards.flash.indexOf(flashElement),1);                    
                }
            });
             cards.cards.cloze.forEach(function(clozeElement){
                if (selectionElement === clozeElement.text){
                    console.log(
                    `second If statement
                    Flash Element: ${clozeElement.text}
                    Selection Element: ${selectionElement}`);
                    console.log(cards.cards.cloze.indexOf(clozeElement));
                    cards.cards.cloze.splice(cards.cards.cloze.indexOf(clozeElement),1)
                    console.log(cards.cards.cloze)
                }
            });
        });
        fs.writeFile("cards.json", JSON.stringify(cards), "utf8");
        Inquirer.prompt([
            {
                type: "confirm",
                message: "Would you like to delete more cards?",
                name: "deleteMoreCards"
            }
        ]).then(function(inqResp){
            if (inqResp.deleteMoreCards){
                deleteCards();
            } else {
                initialMenu();
            }
        });
    });
}

function quiz(){
    if (practiceArr.length > 0){
        var index = Math.floor(Math.random()*practiceArr.length);
        var question = practiceArr[index];
        practiceArr.splice(index,1)
        var prompt = "";
        if (question.type === "cloze"){
            var clozeArr = question.text.split(" ")
            clozeArr.forEach(function(word, index){
                if (question.deletion.includes(word)){
                    clozeArr[index] = "_______";
                }
            });
            prompt = clozeArr.join(" ");
        } else if (question.type === "flash"){
            prompt = question.front;
        }
        console.log(prompt);
        Inquirer.prompt([
            {
                type: "input",
                message: prompt,
                name: "currentQuestion"
            }
        ]).then(function(inqResp){
            console.log(inqResp.currentQuestion);
            
            quiz();
        });
    } else {
        Inquirer.prompt([
            {
                type: "list",
                message: "Your practice deck is empty. Return to 'Main Menu' or 'Practice Menu' to choose new cards.",
                choices: ["Main Menu", "Practice Menu"],
                name: "practiceMore"
            }
        ]).then(function(inqResp){
            if (inqResp.practiceMore === "Main Menu"){
                initialMenu();
            } else {
                practiceMenu();
            }
        });
    }
}
initialMenu();